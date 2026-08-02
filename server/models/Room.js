import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price_per_night: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      default: 2,
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    total_units: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export const Room = mongoose.model('Room', roomSchema);
