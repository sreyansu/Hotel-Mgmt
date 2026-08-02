import express from 'express';
import { Coupon } from '../models/Coupon.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// 1. VALIDATE COUPON (Public on Checkout)
router.get('/validate/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    const coupon = await Coupon.findOne({ code, is_active: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon code' });
    }

    return res.json({
      valid: true,
      code: coupon.code,
      discount_percent: coupon.discount_percent,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error validating coupon', error: error.message });
  }
});

// 2. GET ALL COUPONS (Admin / Staff)
router.get('/admin/all', authenticate, authorizeRoles('super_admin', 'hotel_manager', 'staff'), async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.json({ coupons });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
});

// 3. CREATE COUPON (Admin / Staff)
router.post('/admin', authenticate, authorizeRoles('super_admin', 'hotel_manager', 'staff'), async (req, res) => {
  try {
    const { code, discount_percent } = req.body;

    if (!code || !discount_percent) {
      return res.status(400).json({ message: 'Code and discount percent are required' });
    }

    const formattedCode = code.toUpperCase().trim();
    const existing = await Coupon.findOne({ code: formattedCode });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: formattedCode,
      discount_percent: Number(discount_percent),
      is_active: true,
    });

    return res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
});

// 4. TOGGLE COUPON STATUS (Admin / Staff)
router.patch('/admin/:code/toggle', authenticate, authorizeRoles('super_admin', 'hotel_manager', 'staff'), async (req, res) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    const { is_active } = req.body;

    const coupon = await Coupon.findOneAndUpdate(
      { code },
      { $set: { is_active } },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    return res.json({ message: 'Coupon status updated', coupon });
  } catch (error) {
    return res.status(500).json({ message: 'Error toggling coupon', error: error.message });
  }
});

export default router;
