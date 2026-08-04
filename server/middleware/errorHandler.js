/**
 * ==============================================================================
 * ASYNC HANDLER & ERROR UTILITIES
 * ==============================================================================
 * Eliminates repetitive try-catch blocks across all Express route handlers.
 *
 * Usage:
 *   router.get('/', asyncHandler(async (req, res) => {
 *     const data = await Model.find();
 *     res.json(data);
 *   }));
 *
 * Any thrown error (including async rejections) is automatically caught
 * and forwarded to the global error handler in server.js.
 */

/**
 * Custom application error with HTTP status code support.
 * Throw this inside any route to return a specific status + message.
 *
 * Example: throw new AppError('Hotel not found', 404);
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

/**
 * Higher-order function that wraps an async Express route handler.
 * Catches any errors and passes them to Express's next() error pipeline.
 *
 * Before (repetitive):
 *   router.get('/', async (req, res) => {
 *     try {
 *       const hotels = await Hotel.find();
 *       res.json({ hotels });
 *     } catch (error) {
 *       res.status(500).json({ message: 'Error', error: error.message });
 *     }
 *   });
 *
 * After (clean):
 *   router.get('/', asyncHandler(async (req, res) => {
 *     const hotels = await Hotel.find();
 *     res.json({ hotels });
 *   }));
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handling middleware for Express.
 * Mount this AFTER all route handlers in server.js.
 *
 * Handles:
 * - AppError instances (operational errors with custom status codes)
 * - Mongoose ValidationError (400)
 * - Mongoose CastError / bad ObjectId (400)
 * - Duplicate key errors (400)
 * - Generic unhandled errors (500)
 */
export const globalErrorHandler = (err, req, res, _next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation errors (e.g. missing required fields)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const fields = Object.values(err.errors).map((e) => e.message);
    message = `Validation failed: ${fields.join(', ')}`;
  }

  // Mongoose bad ObjectId cast
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
  }

  // MongoDB duplicate key (e.g. unique email constraint)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value for: ${field}. This record already exists.`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please sign in again.';
  }

  // Log server errors in development
  if (statusCode === 500) {
    console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err.stack || err.message);
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack }),
  });
};
