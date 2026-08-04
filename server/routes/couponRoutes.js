/**
 * ==============================================================================
 * PROMOTIONAL COUPONS ROUTE HANDLERS (/api/coupons)
 * ==============================================================================
 * Endpoints:
 * - GET   /api/coupons/validate/:code      : Validate promo code during checkout (Public)
 * - GET   /api/coupons/admin/all           : List all coupons (Admin / Staff)
 * - POST  /api/coupons/admin               : Create a new discount promo code (Admin / Manager)
 * - PATCH /api/coupons/admin/:code/toggle  : Enable or disable a coupon (Admin / Manager)
 */

import express from 'express';
import { Coupon } from '../models/Coupon.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// 1. VALIDATE PROMO CODE (Public - GET & POST used on Checkout page)
const handleValidateCoupon = asyncHandler(async (req, res) => {
  const rawCode = req.params.code || req.body.code;
  if (!rawCode) {
    throw new AppError('Coupon code is required.', 400);
  }

  const code = rawCode.toUpperCase().trim();
  const coupon = await Coupon.findOne({ code });

  if (!coupon) {
    throw new AppError('Invalid coupon code.', 404);
  }

  if (!coupon.is_active) {
    throw new AppError('This coupon is no longer active.', 400);
  }

  // Only validate expiration if a valid_until date exists
  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    throw new AppError('This coupon has expired.', 400);
  }

  const discount = coupon.discount_percent ?? coupon.discount_percentage ?? 0;

  return res.json({
    valid: true,
    code: coupon.code,
    discount_percent: discount,
    discount_percentage: discount,
    message: `${discount}% discount applied!`,
  });
});

router.get('/validate/:code', handleValidateCoupon);
router.post('/validate', handleValidateCoupon);

// 2. GET ALL COUPONS (Admin / Staff)
router.get('/admin/all', authenticate, authorizeRoles('super_admin', 'hotel_manager', 'staff'), asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return res.json({
    coupons: coupons.map((c) => {
      const discount = c.discount_percent ?? c.discount_percentage ?? 0;
      return {
        ...c.toObject(),
        id: c._id,
        discount_percent: discount,
        discount_percentage: discount,
      };
    }),
  });
}));

// 3. CREATE NEW COUPON (Admin / Manager)
router.post('/admin', authenticate, authorizeRoles('super_admin', 'hotel_manager'), asyncHandler(async (req, res) => {
  const { code, discount_percentage, discount_percent, valid_until } = req.body;
  const discountVal = Number(discount_percentage || discount_percent);

  if (!code || !discountVal) {
    throw new AppError('Code and discount percentage are required.', 400);
  }

  const cleanCode = code.toUpperCase().trim();
  const existing = await Coupon.findOne({ code: cleanCode });
  if (existing) {
    throw new AppError('A coupon with this code already exists.', 400);
  }

  const coupon = await Coupon.create({
    code: cleanCode,
    discount_percent: discountVal,
    discount_percentage: discountVal,
    valid_until: valid_until ? new Date(valid_until) : null,
    is_active: true,
  });

  return res.status(201).json({
    message: 'Coupon created successfully',
    coupon: { ...coupon.toObject(), id: coupon._id },
  });
}));

// 4. TOGGLE COUPON STATUS (Admin / Manager)
router.patch('/admin/:code/toggle', authenticate, authorizeRoles('super_admin', 'hotel_manager'), asyncHandler(async (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const coupon = await Coupon.findOne({ code });

  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }

  coupon.is_active = !coupon.is_active;
  await coupon.save();

  return res.json({
    message: `Coupon ${coupon.is_active ? 'activated' : 'deactivated'} successfully`,
    coupon: { ...coupon.toObject(), id: coupon._id },
  });
}));

export default router;
