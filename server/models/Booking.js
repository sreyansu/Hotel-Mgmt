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
      default: null,
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
      enum: ['pending_payment', 'confirmed', 'cancelled', 'checked_in', 'checked_out'],
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
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid',
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);
