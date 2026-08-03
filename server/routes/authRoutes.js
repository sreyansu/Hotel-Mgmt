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

// 1. REGISTER NEW USER (Public - Customer Only)
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, avatar_url } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
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
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// 2. USER LOGIN (Public)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Lookup user by email and populate hotel details if assigned
    const user = await User.findOne({ email: email.toLowerCase() }).populate('hotel_id');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password against stored bcrypt hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        date_of_birth: user.date_of_birth,
        address: user.address,
        hotel_id: user.hotel_id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// 3. GET CURRENT USER PROFILE (Authenticated)
router.get('/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('hotel_id');
  return res.json({
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      date_of_birth: user.date_of_birth,
      address: user.address,
      hotel_id: user.hotel_id,
    },
  });
});

// 4. UPDATE CURRENT USER PROFILE (Authenticated)
router.put('/profile', authenticate, async (req, res) => {
  try {
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
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        full_name: updatedUser.full_name,
        phone: updatedUser.phone,
        avatar_url: updatedUser.avatar_url,
        date_of_birth: updatedUser.date_of_birth,
        address: updatedUser.address,
        hotel_id: updatedUser.hotel_id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

// 5. GET ALL USERS / STAFF (Super Admin & Hotel Manager)
router.get('/admin/users', authenticate, authorizeRoles('super_admin', 'hotel_manager'), async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('hotel_id').sort({ createdAt: -1 });
    return res.json({
      users: users.map((u) => ({
        id: u._id,
        email: u.email,
        role: u.role,
        full_name: u.full_name,
        phone: u.phone,
        avatar_url: u.avatar_url,
        hotel_id: u.hotel_id,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch team users', error: error.message });
  }
});

// 6. CREATE NEW STAFF / HOTEL MANAGER (Super Admin Only)
router.post('/admin/create-user', authenticate, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const { email, password, full_name, role, hotel_id, phone } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    if (!['super_admin', 'hotel_manager', 'staff', 'customer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
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
      user: {
        id: populatedUser._id,
        email: populatedUser.email,
        role: populatedUser.role,
        full_name: populatedUser.full_name,
        phone: populatedUser.phone,
        avatar_url: populatedUser.avatar_url,
        hotel_id: populatedUser.hotel_id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

// 7. DELETE STAFF / USER (Super Admin Only)
router.delete('/admin/users/:id', authenticate, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToDelete._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own super admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: 'User removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

export default router;
