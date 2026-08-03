/**
 * ==============================================================================
 * AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
 * ==============================================================================
 * 1. authenticate: Validates incoming JWT Bearer token and attaches user object.
 * 2. optionalAuth: Extracts user if token is present (used for guest checkouts).
 * 3. authorizeRoles: Enforces role permissions ('super_admin', 'hotel_manager', etc.).
 */

import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Middleware to verify that the request has a valid JWT Bearer token in headers.
 * If valid, fetches user from database and attaches to `req.user`.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_hotel_mgmt_2026_dev');

    // Retrieve user without sensitive password hash
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User account belonging to this token was not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.', error: error.message });
  }
};

/**
 * Optional authentication middleware:
 * If a token is supplied, attaches `req.user`.
 * If no token is provided, continues as a guest without throwing an error.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_hotel_mgmt_2026_dev');
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    // Non-blocking: continue as guest
  }
  next();
};

/**
 * Role-Based Access Control (RBAC) Guard:
 * Checks if `req.user.role` matches one of the allowed roles.
 * Example: authorizeRoles('super_admin', 'hotel_manager')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};
