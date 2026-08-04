/**
 * ==============================================================================
 * BOOKINGS & RESERVATIONS ROUTE HANDLERS (/api/bookings)
 * ==============================================================================
 * Endpoints:
 * - POST  /api/bookings               : Create new room reservation (Guest or Auth)
 * - GET   /api/bookings/my-bookings   : Retrieve logged-in customer's bookings
 * - GET   /api/bookings/admin/all     : Retrieve all portfolio bookings (Admin/Staff)
 * - PATCH /api/bookings/admin/:id/status : Update stay status (confirmed, checked_in, etc.)
 * - PATCH /api/bookings/admin/:id/details : Update room number, special requests
 */

import express from 'express';
import { Booking } from '../models/Booking.js';
import { Room } from '../models/Room.js';
import { authenticate, optionalAuth, authorizeRoles } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// 1. CREATE BOOKING (Guest or Authenticated User)
router.post('/', optionalAuth, asyncHandler(async (req, res) => {
  const {
    hotel_id, room_id, check_in_date, check_out_date,
    total_price, guest_name, guest_email, guest_phone, payment_status,
  } = req.body;

  if (!hotel_id || !room_id || !check_in_date || !check_out_date || !total_price || !guest_name || !guest_email) {
    throw new AppError('Missing required reservation fields', 400);
  }

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
    booking: { ...booking.toObject(), id: booking._id },
  });
}));

// 2. GET CURRENT USER'S BOOKINGS (Customer)
router.get('/my-bookings', authenticate, asyncHandler(async (req, res) => {
  const bookings = await Booking.find({
    $or: [{ user: req.user._id }, { guest_email: req.user.email }],
  })
    .populate('hotel', 'name slug address images')
    .populate('room', 'name price_per_night images')
    .sort({ createdAt: -1 });

  return res.json({
    bookings: bookings.map((b) => ({ ...b.toObject(), id: b._id })),
  });
}));

// 3. GET ALL BOOKINGS (Admin & Staff)
router.get('/admin/all', authenticate, authorizeRoles('super_admin', 'hotel_manager', 'staff'), asyncHandler(async (req, res) => {
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
}));

// 4. UPDATE BOOKING STATUS (Admin & Staff)
router.patch('/admin/:id/status', authenticate, authorizeRoles('super_admin', 'hotel_manager', 'staff'), asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending_payment', 'confirmed', 'cancelled', 'checked_in', 'checked_out'];

  if (!allowed.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${allowed.join(', ')}`, 400);
  }

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { $set: { status } },
    { new: true }
  );

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  return res.json({
    message: 'Booking status updated successfully',
    booking: { ...booking.toObject(), id: booking._id },
  });
}));

// 5. UPDATE BOOKING DETAILS (Front Desk / Staff: Room Number Assignment & Special Notes)
router.patch('/admin/:id/details', authenticate, authorizeRoles('super_admin', 'hotel_manager', 'staff'), asyncHandler(async (req, res) => {
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
    throw new AppError('Booking not found', 404);
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
}));

export default router;
