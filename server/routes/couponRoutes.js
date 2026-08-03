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

const router = express.Router();

// 1. VALIDATE PROMO CODE (Public - GET & POST used on Checkout page)
const handleValidateCoupon = async (req, res) => {
  try {
    const rawCode = req.params.code || req.body.code;
    if (!rawCode) {
      return res.status(400).json({ valid: false, message: 'Coupon code is required.' });
    }

    const code = rawCode.toUpperCase().trim();
    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid coupon code.' });
    }

    if (!coupon.is_active) {
      return res.status(400).json({ valid: false, message: 'This coupon is no longer active.' });
    }

    // Only validate expiration if a valid_until date exists
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return res.status(400).json({ valid: false, message: 'This coupon has expired.' });
    }

    const discount = coupon.discount_percent ?? coupon.discount_percentage ?? 0;

    return res.json({
      valid: true,
      code: coupon.code,
      discount_percent: discount,
      discount_percentage: discount,
      message: `${discount}% discount applied!`,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error validating coupon', error: error.message });
  }
};

router.get('/validate/:code', handleValidateCoupon);
router.post('/validate', handleValidateCoupon);

// 2. GET ALL COUPONS (Admin / Staff)
router.get('/admin/all', authenticate, authorizeRoles('super_admin', 'hotel_manager', 'staff'), async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
});

// 3. CREATE NEW COUPON (Admin / Manager)
router.post('/admin', authenticate, authorizeRoles('super_admin', 'hotel_manager'), async (req, res) => {
  try {
    const { code, discount_percentage, discount_percent, valid_until } = req.body;
    const discountVal = Number(discount_percentage || discount_percent);

    if (!code || !discountVal) {
      return res.status(400).json({ message: 'Code and discount percentage are required.' });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ message: 'A coupon with this code already exists.' });
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
      coupon: {
        ...coupon.toObject(),
        id: coupon._id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
});

// 4. TOGGLE COUPON STATUS (Admin / Manager)
router.patch('/admin/:code/toggle', authenticate, authorizeRoles('super_admin', 'hotel_manager'), async (req, res) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.is_active = !coupon.is_active;
    await coupon.save();

    return res.json({
      message: `Coupon ${coupon.is_active ? 'activated' : 'deactivated'} successfully`,
      coupon: {
        ...coupon.toObject(),
        id: coupon._id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error toggling coupon status', error: error.message });
  }
});

export default router;
