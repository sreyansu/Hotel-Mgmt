/**
 * ==============================================================================
 * AUTHENTICATION & USER MANAGEMENT ROUTE HANDLERS (/api/auth)
 * ==============================================================================
 * Endpoints:
 * - POST   /api/auth/register          : Public registration (restricted to 'customer' role).
 * - POST   /api/auth/login             : Verify credentials and issue JWT token with role claims.
 * - GET    /api/auth/me                : Fetch authenticated user's profile details.
 * - PUT    /api/auth/profile           : Update authenticated user's profile information.
 * - GET    /api/auth/admin/users       : List team staff and managers (Super Admin & Hotel Manager).
 * - POST   /api/auth/admin/create-user : Provision new staff or manager (Super Admin only).
 * - DELETE /api/auth/admin/users/:id   : Remove a staff or manager account (Super Admin only).
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * Helper: Signs a JSON Web Token containing the user's ID, email, and RBAC role.
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'super_secret_jwt_key_hotel_mgmt_2026_dev',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * Helper: Formats a user document into a safe API response object (no password).
 */
const formatUser = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  full_name: user.full_name,
  phone: user.phone,
  avatar_url: user.avatar_url,
  date_of_birth: user.date_of_birth,
  address: user.address,
  hotel_id: user.hotel_id,
  createdAt: user.createdAt,
});

// 1. REGISTER NEW USER (Public - Customer Only)
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, full_name, avatar_url } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 400);
  }

  // Enforce role: 'customer' strictly for public registration
  const user = await User.create({
    email: email.toLowerCase(),
    password,
    full_name: full_name || '',
    role: 'customer',
    avatar_url: avatar_url || 'avatar-1',
  });

  const token = generateToken(user);

  return res.status(201).json({
    message: 'Account created successfully',
    token,
    user: formatUser(user),
  });
}));

// 2. USER LOGIN (Public)
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).populate('hotel_id');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user);

  return res.json({
    message: 'Login successful',
    token,
    user: formatUser(user),
  });
}));

// 3. GET CURRENT USER PROFILE (Authenticated)
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('hotel_id');
  return res.json({ user: formatUser(user) });
}));

// 4. UPDATE CURRENT USER PROFILE (Authenticated)
router.put('/profile', authenticate, asyncHandler(async (req, res) => {
  const { full_name, phone, address, date_of_birth, avatar_url } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        full_name: full_name !== undefined ? full_name : req.user.full_name,
        phone: phone !== undefined ? phone : req.user.phone,
        address: address !== undefined ? address : req.user.address,
        date_of_birth: date_of_birth !== undefined ? date_of_birth : req.user.date_of_birth,
        avatar_url: avatar_url !== undefined ? avatar_url : req.user.avatar_url,
      },
    },
    { new: true }
  ).select('-password').populate('hotel_id');

  return res.json({
    message: 'Profile updated successfully',
    user: formatUser(updatedUser),
  });
}));

// 5. GET ALL USERS / STAFF (Super Admin & Hotel Manager)
router.get('/admin/users', authenticate, authorizeRoles('super_admin', 'hotel_manager'), asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').populate('hotel_id').sort({ createdAt: -1 });
  return res.json({ users: users.map(formatUser) });
}));

// 6. CREATE NEW STAFF / HOTEL MANAGER (Super Admin Only)
router.post('/admin/create-user', authenticate, authorizeRoles('super_admin'), asyncHandler(async (req, res) => {
  const { email, password, full_name, role, hotel_id, phone } = req.body;

  if (!email || !password || !role) {
    throw new AppError('Email, password, and role are required', 400);
  }

  if (!['super_admin', 'hotel_manager', 'staff', 'customer'].includes(role)) {
    throw new AppError('Invalid role specified', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 400);
  }

  const newUser = await User.create({
    email: email.toLowerCase(),
    password,
    full_name: full_name || '',
    role,
    hotel_id: hotel_id || null,
    phone: phone || '',
    avatar_url: 'avatar-1',
  });

  const populatedUser = await User.findById(newUser._id).select('-password').populate('hotel_id');

  return res.status(201).json({
    message: `${role.replace('_', ' ').toUpperCase()} created successfully`,
    user: formatUser(populatedUser),
  });
}));

// 7. DELETE STAFF / USER (Super Admin Only)
router.delete('/admin/users/:id', authenticate, authorizeRoles('super_admin'), asyncHandler(async (req, res) => {
  const userToDelete = await User.findById(req.params.id);
  if (!userToDelete) {
    throw new AppError('User not found', 404);
  }

  if (userToDelete._id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot delete your own super admin account', 400);
  }

  await User.findByIdAndDelete(req.params.id);
  return res.json({ message: 'User removed successfully' });
}));

export default router;
