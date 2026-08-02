import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
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
      default: '',
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
  },
  { timestamps: true }
);

export const Hotel = mongoose.model('Hotel', hotelSchema);
