import express from 'express';
import { Hotel } from '../models/Hotel.js';
import { Room } from '../models/Room.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// 1. GET ALL HOTELS (Public)
router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });

    // Fetch minimum room price for each hotel for listing display
    const hotelList = await Promise.all(
      hotels.map(async (hotel) => {
        const rooms = await Room.find({ hotel: hotel._id }).sort({ price_per_night: 1 });
        const startingPrice = rooms.length > 0 ? rooms[0].price_per_night : 0;
        return {
          ...hotel.toObject(),
          id: hotel._id,
          rooms_count: rooms.length,
          starting_price: startingPrice,
          rooms,
        };
      })
    );

    return res.json({ hotels: hotelList });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching hotels', error: error.message });
  }
});

// 2. GET SINGLE HOTEL BY SLUG (Public)
router.get('/:slug', async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ slug: req.params.slug });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const rooms = await Room.find({ hotel: hotel._id });

    return res.json({
      hotel: {
        ...hotel.toObject(),
        id: hotel._id,
      },
      rooms: rooms.map((r) => ({
        ...r.toObject(),
        id: r._id,
      })),
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

// 4. CREATE HOTEL (Admin only)
router.post('/', authenticate, authorizeRoles('super_admin', 'hotel_manager'), async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    return res.status(201).json({ message: 'Hotel created', hotel });
  } catch (error) {
    return res.status(400).json({ message: 'Failed to create hotel', error: error.message });
  }
});

// 5. UPDATE HOTEL (Admin only)
router.put('/:id', authenticate, authorizeRoles('super_admin', 'hotel_manager'), async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json({ message: 'Hotel updated', hotel });
  } catch (error) {
    return res.status(400).json({ message: 'Failed to update hotel', error: error.message });
  }
});

// 6. CREATE ROOM (Admin only)
router.post('/rooms', authenticate, authorizeRoles('super_admin', 'hotel_manager'), async (req, res) => {
  try {
    const room = await Room.create(req.body);
    return res.status(201).json({ message: 'Room created', room });
  } catch (error) {
    return res.status(400).json({ message: 'Failed to create room', error: error.message });
  }
});

// 7. UPDATE ROOM (Admin only)
router.put('/rooms/:id', authenticate, authorizeRoles('super_admin', 'hotel_manager', 'staff'), async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json({ message: 'Room updated', room });
  } catch (error) {
    return res.status(400).json({ message: 'Failed to update room', error: error.message });
  }
});

export default router;
