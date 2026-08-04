/**
 * ==============================================================================
 * HOTELS & ROOMS ROUTE HANDLERS (/api/hotels)
 * ==============================================================================
 * Endpoints:
 * - GET  /api/hotels               : List all hotels with starting prices (Public)
 * - GET  /api/hotels/:slug         : Fetch hotel details & rooms by slug (Public)
 * - GET  /api/hotels/rooms/details/:id : Fetch room details with populated hotel (Public)
 * - GET  /api/hotels/admin/rooms   : List all inventory rooms (Admin / Staff)
 * - POST /api/hotels               : Create new hotel property (Super Admin / Manager)
 * - POST /api/hotels/rooms         : Add new room to hotel (Super Admin / Manager)
 * - PATCH /api/hotels/rooms/:id    : Update room suite / pricing (Super Admin / Manager)
 * - DELETE /api/hotels/rooms/:id   : Delete room suite (Super Admin / Manager)
 */

import express from 'express';
import { Hotel } from '../models/Hotel.js';
import { Room } from '../models/Room.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// 1. GET ALL HOTELS (Public)
router.get('/', asyncHandler(async (req, res) => {
  const hotels = await Hotel.find().sort({ rating: -1 });

  const hotelsWithPricing = await Promise.all(
    hotels.map(async (hotel) => {
      const lowestRoom = await Room.find({ hotel: hotel._id })
        .sort({ price_per_night: 1 })
        .limit(1);

      return {
        ...hotel.toObject(),
        id: hotel._id,
        starting_price: lowestRoom.length > 0 ? lowestRoom[0].price_per_night : 4500,
        city: hotel.address.split(',')[1]?.trim() || hotel.address,
      };
    })
  );

  return res.json({ hotels: hotelsWithPricing });
}));

// 2. GET SINGLE HOTEL BY SLUG WITH ITS ROOMS (Public)
router.get('/:slug', asyncHandler(async (req, res) => {
  const hotel = await Hotel.findOne({ slug: req.params.slug });
  if (!hotel) {
    throw new AppError('Hotel not found', 404);
  }

  const rooms = await Room.find({ hotel: hotel._id });
  const formattedRooms = rooms.map((r) => ({
    ...r.toObject(),
    id: r._id,
    available: (r.total_units || 0) > 0,
  }));

  return res.json({
    hotel: {
      ...hotel.toObject(),
      id: hotel._id,
      rooms: formattedRooms,
    },
    rooms: formattedRooms,
  });
}));

// 2b. GET SINGLE ROOM WITH HOTEL (Public)
router.get('/rooms/details/:id', asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('hotel');
  if (!room) {
    throw new AppError('Room not found', 404);
  }

  return res.json({
    room: {
      ...room.toObject(),
      id: room._id,
      hotel: room.hotel ? { ...room.hotel.toObject(), id: room.hotel._id } : null,
    },
  });
}));

// 3. GET ALL ROOMS (Admin / Staff)
router.get('/admin/rooms', authenticate, authorizeRoles('super_admin', 'hotel_manager', 'staff'), asyncHandler(async (req, res) => {
  const rooms = await Room.find().populate('hotel', 'name slug address');
  return res.json({
    rooms: rooms.map((r) => ({
      ...r.toObject(),
      id: r._id,
      hotels: r.hotel ? { name: r.hotel.name } : null,
    })),
  });
}));

// 4. CREATE HOTEL (Admin / Manager)
router.post('/', authenticate, authorizeRoles('super_admin', 'hotel_manager'), asyncHandler(async (req, res) => {
  const { name, slug, address, description, amenities, images, rating, contact_email, contact_phone } = req.body;

  if (!name || !slug || !address) {
    throw new AppError('Name, slug, and address are required', 400);
  }

  const hotel = await Hotel.create({
    name,
    slug: slug.toLowerCase(),
    address,
    description: description || '',
    amenities: amenities || [],
    images: images || [],
    rating: rating || 4.8,
    contact_email: contact_email || '',
    contact_phone: contact_phone || '',
  });

  return res.status(201).json({
    message: 'Hotel created successfully',
    hotel: { ...hotel.toObject(), id: hotel._id },
  });
}));

// 5. CREATE ROOM (Admin / Manager)
router.post('/rooms', authenticate, authorizeRoles('super_admin', 'hotel_manager'), asyncHandler(async (req, res) => {
  const { hotel_id, name, description, price_per_night, capacity, images, amenities, total_units } = req.body;

  if (!hotel_id || !name || !price_per_night) {
    throw new AppError('Hotel, room name, and price per night are required', 400);
  }

  const room = await Room.create({
    hotel: hotel_id,
    name,
    description: description || '',
    price_per_night,
    capacity: capacity || 2,
    images: images || [],
    amenities: amenities || [],
    total_units: total_units || 5,
  });

  return res.status(201).json({
    message: 'Room created successfully',
    room: { ...room.toObject(), id: room._id },
  });
}));

// 6. UPDATE ROOM SUITE / DYNAMIC PRICING (Admin / Manager)
router.patch('/rooms/:id', authenticate, authorizeRoles('super_admin', 'hotel_manager'), asyncHandler(async (req, res) => {
  const { price_per_night, total_units, name, description, capacity, amenities } = req.body;
  const updates = {};
  if (price_per_night !== undefined) updates.price_per_night = Number(price_per_night);
  if (total_units !== undefined) updates.total_units = Number(total_units);
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (capacity !== undefined) updates.capacity = Number(capacity);
  if (amenities !== undefined) updates.amenities = amenities;

  const room = await Room.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true }
  ).populate('hotel', 'name slug address');

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  return res.json({
    message: 'Room suite updated successfully',
    room: {
      ...room.toObject(),
      id: room._id,
      hotels: room.hotel ? { name: room.hotel.name } : null,
    },
  });
}));

// 7. DELETE ROOM SUITE (Admin / Manager)
router.delete('/rooms/:id', authenticate, authorizeRoles('super_admin', 'hotel_manager'), asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndDelete(req.params.id);
  if (!room) {
    throw new AppError('Room not found', 404);
  }
  return res.json({ message: 'Room deleted successfully' });
}));

export default router;
