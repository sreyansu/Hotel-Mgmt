/**
 * ==============================================================================
 * BOOKING MODEL (Mongoose Schema)
 * ==============================================================================
 * Manages guest reservations, dates, pricing, payment state, and stay lifecycle.
 * Links to:
 * - Hotel (ObjectId reference)
 * - Room (ObjectId reference)
 * - User (Optional ObjectId reference for registered customers or guests)
 */

import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Nullable for guest checkouts
    },
    check_in_date: {
      type: String,
      required: true,
    },
    check_out_date: {
      type: String,
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'checked_in', 'checked_out', 'cancelled'],
      default: 'confirmed',
    },
    guest_name: {
      type: String,
      required: true,
    },
    guest_email: {
      type: String,
      required: true,
    },
    guest_phone: {
      type: String,
      default: '',
    },
    room_number: {
      type: String,
      default: '',
    },
    special_requests: {
      type: String,
      default: '',
    },
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'paid',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

export const Booking = mongoose.model('Booking', bookingSchema);
