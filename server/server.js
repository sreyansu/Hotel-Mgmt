/**
 * ==============================================================================
 * MAIN SERVER ENTRY POINT (Express + Node.js)
 * ==============================================================================
 * This file configures the Express application, sets up middleware (CORS, JSON parsing),
 * connects to MongoDB, mounts REST API route handlers, and starts the HTTP server.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Import Route Handlers
import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import couponRoutes from './routes/couponRoutes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Port Configuration: Defaults to 5001 (port 5000 is reserved on macOS for AirPlay)
const PORT = process.env.PORT || 5001;

// 1. Connect to MongoDB instance
connectDB();

// 2. Global Middleware
// CORS: Allows frontend running on Vite (http://localhost:5173) to communicate with API
app.use(cors({
  origin: '*', 
  credentials: true,
}));

// Body Parser: Parse incoming JSON payloads in request body
app.use(express.json());

// 3. Mount REST API Routes
app.use('/api/auth', authRoutes);       // Authentication & Profile management
app.use('/api/hotels', hotelRoutes);     // Hotels & Rooms catalog
app.use('/api/bookings', bookingRoutes); // Reservations & Status workflows
app.use('/api/coupons', couponRoutes);   // Discount promos & coupon validation

// 4. Health Check Endpoint (Used for system monitoring & uptime verification)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Hotel Management API Running',
  });
});

// 5. Global Error Handling Middleware (Catches unhandled errors across routes)
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
  });
});

// 6. Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
