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
 */

import express from 'express';
import { Hotel } from '../models/Hotel.js';
import { Room } from '../models/Room.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// 1. GET ALL HOTELS (Public)
router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ rating: -1 });

    // Aggregate starting price for each hotel property
    const hotelsWithPricing = await Promise.all(
      hotels.map(async (hotel) => {
        const lowestRoom = await Room.find({ hotel: hotel._id })
          .sort({ price_per_night: 1 })
          .limit(1);

        const startingPrice = lowestRoom.length > 0 ? lowestRoom[0].price_per_night : 4500;

        return {
          ...hotel.toObject(),
          id: hotel._id,
          starting_price: startingPrice,
          city: hotel.address.split(',')[1]?.trim() || hotel.address,
        };
      })
    );

    return res.json({ hotels: hotelsWithPricing });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching hotels', error: error.message });
  }
});

// 2. GET SINGLE HOTEL BY SLUG WITH ITS ROOMS (Public)
router.get('/:slug', async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ slug: req.params.slug });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
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
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching hotel details', error: error.message });
  }
});

// 2b. GET SINGLE ROOM WITH HOTEL (Public)
router.get('/rooms/details/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    return res.json({
      room: {
        ...room.toObject(),
        id: room._id,
        hotel: room.hotel ? { ...room.hotel.toObject(), id: room.hotel._id } : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching room details', error: error.message });
  }
});

// 3. GET ALL ROOMS (Admin / Staff)
router.get('/admin/rooms', authenticate, authorizeRoles('super_admin', 'hotel_manager', 'staff'), async (req, res) => {
  try {
    const rooms = await Room.find().populate('hotel', 'name slug address');
    return res.json({
      rooms: rooms.map((r) => ({
        ...r.toObject(),
        id: r._id,
        hotels: r.hotel ? { name: r.hotel.name } : null,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
});

// 4. CREATE HOTEL (Admin / Manager)
router.post('/', authenticate, authorizeRoles('super_admin', 'hotel_manager'), async (req, res) => {
  try {
    const { name, slug, address, description, amenities, images, rating, contact_email, contact_phone } = req.body;

    if (!name || !slug || !address) {
      return res.status(400).json({ message: 'Name, slug, and address are required' });
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
      hotel: {
        ...hotel.toObject(),
        id: hotel._id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating hotel', error: error.message });
  }
});

// 5. CREATE ROOM (Admin / Manager)
router.post('/rooms', authenticate, authorizeRoles('super_admin', 'hotel_manager'), async (req, res) => {
  try {
    const { hotel_id, name, description, price_per_night, capacity, images, amenities, total_units } = req.body;

    if (!hotel_id || !name || !price_per_night) {
      return res.status(400).json({ message: 'Hotel, room name, and price per night are required' });
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
      room: {
        ...room.toObject(),
        id: room._id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating room', error: error.message });
  }
});

// 6. UPDATE ROOM SUITE / DYNAMIC PRICING (Admin / Manager)
router.patch('/rooms/:id', authenticate, authorizeRoles('super_admin', 'hotel_manager'), async (req, res) => {
  try {
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
      return res.status(404).json({ message: 'Room not found' });
    }

    return res.json({
      message: 'Room suite updated successfully',
      room: {
        ...room.toObject(),
        id: room._id,
        hotels: room.hotel ? { name: room.hotel.name } : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating room', error: error.message });
  }
});

// 7. DELETE ROOM SUITE (Admin / Manager)
router.delete('/rooms/:id', authenticate, authorizeRoles('super_admin', 'hotel_manager'), async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    return res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting room', error: error.message });
  }
});

export default router;
