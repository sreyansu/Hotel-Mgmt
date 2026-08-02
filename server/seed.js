import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Hotel } from './models/Hotel.js';
import { Room } from './models/Room.js';
import { Booking } from './models/Booking.js';
import { Coupon } from './models/Coupon.js';

dotenv.config();

const hotelsData = [
  {
    slug: 'grand-imperial-delhi',
    name: 'Grand Imperial Hotel',
    description: 'Experience imperial luxury in the capital. Close to historical monuments and diplomatic quarters.',
    address: 'Connaught Place, New Delhi, 110001',
    images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000&auto=format&fit=crop'],
    amenities: ['Pool', 'Spa', 'Gym', 'WiFi', 'Fine Dining'],
    contact_email: 'delhi@grandhotels.com',
    contact_phone: '+91-11-2222-3333',
    rooms: [
      {
        name: 'Imperial Suite',
        description: 'Luxury suite with panoramic city views, plush king bed, and private lounge.',
        price_per_night: 9500,
        capacity: 2,
        images: ['https://images.unsplash.com/photo-1631049307204-6c0ec7ebc952?q=80&w=1000'],
        amenities: ['King Bed', 'Bathtub', 'High-speed WiFi', 'Mini Bar'],
        total_units: 5,
      },
      {
        name: 'Deluxe Room',
        description: 'Spacious room designed for business travelers and leisure with ergonomic desk.',
        price_per_night: 5500,
        capacity: 2,
        images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000'],
        amenities: ['Queen Bed', 'Desk', 'City View'],
        total_units: 10,
      },
    ],
  },
  {
    slug: 'grand-seaview-goa',
    name: 'Grand Seaview Resort',
    description: 'Relax by the tranquil ocean breeze in our pristine coastal getaway resort.',
    address: 'Calangute, Goa, 403516',
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000'],
    amenities: ['Beach Access', 'Pool', 'Bar', 'WiFi', 'Water Sports'],
    contact_email: 'goa@grandhotels.com',
    contact_phone: '+91-832-2222-3333',
    rooms: [
      {
        name: 'Ocean Villa',
        description: 'Private beachfront villa with personal infinity plunge pool and terrace.',
        price_per_night: 8000,
        capacity: 4,
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000'],
        amenities: ['Private Pool', 'Kitchenette', 'Sea View'],
        total_units: 3,
      },
      {
        name: 'Standard Poolside Room',
        description: 'Cozy room with instant access to the resort pool and tropical gardens.',
        price_per_night: 3500,
        capacity: 2,
        images: ['https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=1000'],
        amenities: ['Twin Beds', 'Balcony', 'Garden View'],
        total_units: 20,
      },
    ],
  },
  {
    slug: 'grand-heritage-jaipur',
    name: 'Grand Heritage Palace',
    description: 'Live like royalty surrounded by authentic Rajasthani architecture and courtyards.',
    address: 'Amer Road, Jaipur, 302002',
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000'],
    amenities: ['Heritage Walk', 'Restaurant', 'WiFi', 'Cultural Dance'],
    contact_email: 'jaipur@grandhotels.com',
    contact_phone: '+91-141-2222-3333',
    rooms: [
      {
        name: 'Royal Heritage Suite',
        description: 'Opulent decorative suite with authentic antique furnishings and marble bathtub.',
        price_per_night: 10000,
        capacity: 2,
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000'],
        amenities: ['Jacuzzi', 'King Bed', 'Palace View'],
        total_units: 2,
      },
      {
        name: 'Haveli Courtyard Room',
        description: 'Traditional handcrafted room opening into the main fountain courtyard.',
        price_per_night: 4500,
        capacity: 2,
        images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000'],
        amenities: ['Queen Bed', 'Courtyard View'],
        total_units: 8,
      },
    ],
  },
];

const couponsData = [
  { code: 'WELCOME10', discount_percent: 10, is_active: true },
  { code: 'SUMMER20', discount_percent: 20, is_active: true },
  { code: 'LUXURY25', discount_percent: 25, is_active: true },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_mgmt');
    console.log('🌱 Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});
    await Coupon.deleteMany({});
    console.log('🧹 Cleared existing database records.');

    // 1. Seed Users
    const adminUser = await User.create({
      email: 'admin@grandpalace.com',
      password: 'admin123',
      role: 'super_admin',
      full_name: 'System Administrator',
      phone: '+91-98765-43210',
    });

    const customerUser = await User.create({
      email: 'customer@example.com',
      password: 'customer123',
      role: 'customer',
      full_name: 'John Doe',
      phone: '+91-91234-56789',
      address: '123 Park Avenue, Mumbai',
    });

    console.log('👤 Seeded Admin & Customer accounts:');
    console.log('   - Admin: admin@grandpalace.com / admin123 (super_admin)');
    console.log('   - Customer: customer@example.com / customer123 (customer)');

    // 2. Seed Coupons
    await Coupon.insertMany(couponsData);
    console.log(`🎟️ Seeded ${couponsData.length} discount coupons.`);

    // 3. Seed Hotels & Rooms
    let firstHotelId = null;
    let firstRoomId = null;

    for (const hData of hotelsData) {
      const { rooms, ...hotelFields } = hData;
      const hotel = await Hotel.create(hotelFields);
      if (!firstHotelId) firstHotelId = hotel._id;

      for (const rData of rooms) {
        const room = await Room.create({
          ...rData,
          hotel: hotel._id,
        });
        if (!firstRoomId) firstRoomId = room._id;
      }
    }
    console.log(`🏨 Seeded ${hotelsData.length} hotels and room catalogs.`);

    // 4. Seed Sample Reservations
    if (firstHotelId && firstRoomId) {
      await Booking.create({
        hotel: firstHotelId,
        room: firstRoomId,
        user: customerUser._id,
        check_in_date: '2026-08-10',
        check_out_date: '2026-08-14',
        total_price: 38000,
        status: 'confirmed',
        guest_name: 'John Doe',
        guest_email: 'customer@example.com',
        guest_phone: '+91-91234-56789',
        payment_status: 'paid',
      });

      await Booking.create({
        hotel: firstHotelId,
        room: firstRoomId,
        user: null,
        check_in_date: '2026-08-15',
        check_out_date: '2026-08-18',
        total_price: 28500,
        status: 'pending_payment',
        guest_name: 'Jane Smith',
        guest_email: 'jane.smith@gmail.com',
        guest_phone: '+91-99887-76655',
        payment_status: 'pending',
      });
      console.log('📅 Seeded demo reservations.');
    }

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
