/**
 * ==============================================================================
 * COUPON MODEL (Mongoose Schema)
 * ==============================================================================
 * Manages promotional discount codes applicable during customer checkout.
 * Supports:
 * - `code`: Uppercase promo code string (e.g. WELCOME10, SUMMER20).
 * - `discount_percent` / `discount_percentage`: Percentage discount (1 - 100).
 * - `valid_until`: Expiration date (optional).
 * - `is_active`: Boolean status toggle.
 */

import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discount_percent: {
      type: Number,
      min: 1,
      max: 100,
    },
    discount_percentage: {
      type: Number,
      min: 1,
      max: 100,
    },
    valid_until: {
      type: Date,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: ensure both discount_percent and discount_percentage are synchronized
couponSchema.pre('save', function (next) {
  if (this.discount_percentage && !this.discount_percent) {
    this.discount_percent = this.discount_percentage;
  } else if (this.discount_percent && !this.discount_percentage) {
    this.discount_percentage = this.discount_percent;
  }
  next();
});

export const Coupon = mongoose.model('Coupon', couponSchema);
