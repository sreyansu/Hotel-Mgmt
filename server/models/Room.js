/**
 * ==============================================================================
 * ROOM MODEL (Mongoose Schema)
 * ==============================================================================
 * Represents individual room categories associated with a Hotel property.
 * Links to Hotel via ObjectId foreign reference.
 */

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
      min: 0,
    },
    capacity: {
      type: Number,
      default: 2,
      min: 1,
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
      default: 5,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const Room = mongoose.model('Room', roomSchema);
