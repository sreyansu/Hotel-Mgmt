/**
 * ==============================================================================
 * BOOKINGS & RESERVATIONS ROUTE HANDLERS (/api/bookings)
 * ==============================================================================
 * Endpoints:
 * - POST  /api/bookings               : Create new room reservation (Guest or Auth)
 * - GET   /api/bookings/my-bookings   : Retrieve logged-in customer's bookings
 * - GET   /api/bookings/admin/all     : Retrieve all portfolio bookings (Admin/Staff)
 * - PATCH /api/bookings/admin/:id/status : Update stay status (confirmed, checked_in, etc.)
 */

import express from 'express';
import { Booking } from '../models/Booking.js';
import { Room } from '../models/Room.js';
import { authenticate, optionalAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// 1. CREATE BOOKING (Guest or Authenticated User)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      hotel_id,
      room_id,
      check_in_date,
      check_out_date,
      total_price,
      guest_name,
      guest_email,
      guest_phone,
      payment_status,
    } = req.body;

    // Validate mandatory booking fields
    if (!hotel_id || !room_id || !check_in_date || !check_out_date || !total_price || !guest_name || !guest_email) {
      return res.status(400).json({ message: 'Missing required reservation fields' });
    }

    // Save booking record to MongoDB
    const booking = await Booking.create({
      hotel: hotel_id,
      room: room_id,
      user: req.user ? req.user._id : null,
      check_in_date,
      check_out_date,
      total_price,
      guest_name,
      guest_email,
      guest_phone: guest_phone || '',
      payment_status: payment_status || 'paid',
      status: 'confirmed',
    });

    return res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        ...booking.toObject(),
        id: booking._id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
});

// 2. GET CURRENT USER'S BOOKINGS (Customer)
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ user: req.user._id }, { guest_email: req.user.email }],
    })
      .populate('hotel', 'name slug address images')
      .populate('room', 'name price_per_night images')
      .sort({ createdAt: -1 });

    return res.json({
      bookings: bookings.map((b) => ({
        ...b.toObject(),
        id: b._id,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user bookings', error: error.message });
  }
});

// 3. GET ALL BOOKINGS (Admin & Staff)
router.get('/admin/all', authenticate, authorizeRoles('super_admin', 'hotel_manager', 'staff'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('hotel', 'name slug address')
      .populate('room', 'name price_per_night')
      .populate('user', 'email full_name')
      .sort({ createdAt: -1 });

    return res.json({
      bookings: bookings.map((b) => ({
        ...b.toObject(),
        id: b._id,
        hotels: b.hotel ? { name: b.hotel.name } : null,
        rooms: b.room ? { name: b.room.name, price_per_night: b.room.price_per_night } : null,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch admin bookings', error: error.message });
  }
});

// 4. UPDATE BOOKING STATUS (Admin & Staff)
router.patch('/admin/:id/status', authenticate, authorizeRoles('super_admin', 'hotel_manager', 'staff'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending_payment', 'confirmed', 'cancelled', 'checked_in', 'checked_out'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.json({
      message: 'Booking status updated successfully',
      booking: {
        ...booking.toObject(),
        id: booking._id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update booking status', error: error.message });
  }
});

// 5. UPDATE BOOKING DETAILS (Front Desk / Staff: Room Number Assignment & Special Notes)
router.patch('/admin/:id/details', authenticate, authorizeRoles('super_admin', 'hotel_manager', 'staff'), async (req, res) => {
  try {
    const { room_number, special_requests, status } = req.body;
    const updates = {};
    if (room_number !== undefined) updates.room_number = room_number;
    if (special_requests !== undefined) updates.special_requests = special_requests;
    if (status !== undefined) updates.status = status;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    )
      .populate('hotel', 'name slug address')
      .populate('room', 'name price_per_night');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.json({
      message: 'Booking details updated successfully',
      booking: {
        ...booking.toObject(),
        id: booking._id,
        hotels: booking.hotel ? { name: booking.hotel.name } : null,
        rooms: booking.room ? { name: booking.room.name, price_per_night: booking.room.price_per_night } : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update booking details', error: error.message });
  }
});

export default router;
