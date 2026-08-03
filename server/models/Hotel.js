/**
 * ==============================================================================
 * HOTEL MODEL (Mongoose Schema)
 * ==============================================================================
 * Represents property listings within the hotel chain.
 * Fields include slug for SEO-friendly URLs, amenities, address, and ratings.
 */

import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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
    address: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    contact_email: {
      type: String,
      default: '',
    },
    contact_phone: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

export const Hotel = mongoose.model('Hotel', hotelSchema);
