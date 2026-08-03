/**
 * ==============================================================================
 * USER MODEL (Mongoose Schema)
 * ==============================================================================
 * Represents system users including Customers, Staff, and Administrators.
 * Features:
 * - Pre-save hook: Automatically hashes passwords with bcrypt before storing.
 * - comparePassword method: Compares candidate plaintext password with hash.
 * - RBAC roles: 'customer', 'staff', 'hotel_manager', 'super_admin'.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['customer', 'staff', 'hotel_manager', 'super_admin'],
      default: 'customer',
    },
    full_name: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    avatar_url: {
      type: String,
      default: '',
    },
    date_of_birth: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    // Optional reference if user is a hotel manager or staff tied to a single hotel
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt timestamps
  }
);

/**
 * Pre-Save Middleware:
 * Automatically hashes plaintext password with salt rounds (10) when created or modified.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance Method:
 * Validates candidate password against hashed database password.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
