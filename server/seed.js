/**
 * ==============================================================================
 * DATABASE SEEDER (MongoDB Mongoose) - PARADISE PALACE HOTELS
 * ==============================================================================
 * Seeds:
 * 1. 6 Signature PARADISE Palace Hotel Properties across India
 * 2. Complete Room Suites Catalog with pricing in INR (₹)
 * 3. 4 Pre-Configured RBAC Demo Accounts (Super Admin, Hotel Manager, Staff, Customer)
 *    - Hotel Manager & Front Desk Staff assigned to PARADISE Palace Hotel - New Delhi
 * 4. Active Promo Coupons (WELCOME10, SUMMER20, LUXURY25)
 * 5. Active Reservations for Front Desk & Management operations
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Hotel } from './models/Hotel.js';
import { Room } from './models/Room.js';
import { Booking } from './models/Booking.js';
import { Coupon } from './models/Coupon.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_mgmt';

async function seedDatabase() {
  try {
    console.log('🌱 Connected to MongoDB for seeding...');
    await mongoose.connect(mongoUri);

    // 1. Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Hotel.deleteMany({}),
      Room.deleteMany({}),
      Booking.deleteMany({}),
      Coupon.deleteMany({}),
    ]);
    console.log('🧹 Cleared existing database records.');

    // 2. Seed 6 PARADISE Palace Luxury Hotels
    const hotel1 = await Hotel.create({
      slug: 'paradise-palace-delhi',
      name: 'PARADISE Palace Hotel - New Delhi',
      description: 'Experience imperial luxury in the capital. Close to historical monuments, diplomatic enclaves, and premier shopping.',
      address: 'Connaught Place, New Delhi, 110001',
      images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000&auto=format&fit=crop'],
      amenities: ['Pool', 'Spa', 'Gym', 'WiFi', 'Fine Dining', 'Airport Shuttle'],
      contact_email: 'delhi@paradisepalace.com',
      contact_phone: '+91-11-2222-3333',
      rating: 4.9,
    });

    const hotel2 = await Hotel.create({
      slug: 'paradise-seaview-goa',
      name: 'PARADISE Seaview Resort - Goa',
      description: 'Sun, sand, and tranquility. Luxury beachside resort in North Goa with private beach access and sunset cocktails.',
      address: 'Calangute Beach Road, Goa, 403516',
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000'],
      amenities: ['Beach Access', 'Infinity Pool', 'Beach Bar', 'Spa', 'WiFi'],
      contact_email: 'goa@paradisepalace.com',
      contact_phone: '+91-832-2222-3333',
      rating: 4.8,
    });

    const hotel3 = await Hotel.create({
      slug: 'paradise-heritage-jaipur',
      name: 'PARADISE Heritage Palace - Jaipur',
      description: 'Royal Rajasthani hospitality in a restored heritage palace featuring authentic architecture and hand-carved pavilions.',
      address: 'Amer Road, Jaipur, Rajasthan, 302002',
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000'],
      amenities: ['Heritage Courtyard', 'Cultural Shows', 'Royal Dining', 'Spa', 'Pool'],
      contact_email: 'jaipur@paradisepalace.com',
      contact_phone: '+91-141-2222-3333',
      rating: 4.9,
    });

    const hotel4 = await Hotel.create({
      slug: 'paradise-marina-mumbai',
      name: 'PARADISE Marina Bay - Mumbai',
      description: 'Modern luxury overlooking the Arabian Sea in South Mumbai. World-class culinary experiences and rooftop infinity lounge.',
      address: 'Marine Drive, Nariman Point, Mumbai, 400021',
      images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000'],
      amenities: ['Ocean View', 'Rooftop Lounge', 'Helipad', 'Michelin-star Chef', 'Spa'],
      contact_email: 'mumbai@paradisepalace.com',
      contact_phone: '+91-22-2222-3333',
      rating: 4.9,
    });

    const hotel5 = await Hotel.create({
      slug: 'paradise-lake-udaipur',
      name: 'PARADISE Lake Palace - Udaipur',
      description: 'A magical palace setting rising out of Lake Pichola. Breathtaking views of the Aravalli hills and royal courtyards.',
      address: 'Lake Pichola, Udaipur, Rajasthan, 313001',
      images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000'],
      amenities: ['Boat Transfer', 'Lake View', 'Ayurvedic Spa', 'Royal Banquet', 'Pool'],
      contact_email: 'udaipur@paradisepalace.com',
      contact_phone: '+91-294-2222-3333',
      rating: 5.0,
    });

    const hotel6 = await Hotel.create({
      slug: 'paradise-alpine-manali',
      name: 'PARADISE Alpine Retreat - Manali',
      description: 'Cozy pine wood chalets and luxury alpine suites nestled in the snow-capped Himalayan peaks of Manali.',
      address: 'Solang Valley Road, Manali, Himachal Pradesh, 175131',
      images: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1000'],
      amenities: ['Mountain View', 'Heated Jacuzzi', 'Fireplace Lounge', 'Skiing', 'Trekking Concierge'],
      contact_email: 'manali@paradisepalace.com',
      contact_phone: '+91-1902-2222-3333',
      rating: 4.9,
    });

    console.log('🏨 Seeded 6 Signature PARADISE Palace Hotels.');

    // 3. Seed RBAC Accounts with Assigned Hotel Context
    const adminUser = await User.create({
      email: process.env.DEFAULT_SUPERADMIN_EMAIL || 'admin@grandhotels.com',
      password: process.env.DEFAULT_SUPERADMIN_PASSWORD || 'admin@123',
      role: 'super_admin',
      full_name: 'Alexander Hamilton',
      phone: '+91-98765-43210',
      avatar_url: 'avatar-1',
    });

    const managerUser = await User.create({
      email: process.env.DEFAULT_MANAGER_EMAIL || 'manager@grandhotels.com',
      password: process.env.DEFAULT_MANAGER_PASSWORD || 'manager@123',
      role: 'hotel_manager',
      full_name: 'Priya Sharma',
      phone: '+91-98765-11223',
      avatar_url: 'avatar-2',
      hotel_id: hotel1._id,
    });

    const staffUser = await User.create({
      email: process.env.DEFAULT_STAFF_EMAIL || 'staff@gmail.com',
      password: process.env.DEFAULT_STAFF_PASSWORD || 'staff@123',
      role: 'staff',
      full_name: 'David Miller',
      phone: '+91-98765-33445',
      avatar_url: 'avatar-3',
      hotel_id: hotel1._id,
    });

    const customerUser = await User.create({
      email: process.env.DEFAULT_CUSTOMER_EMAIL || 'customer@gmail.com',
      password: process.env.DEFAULT_CUSTOMER_PASSWORD || 'customer@123',
      role: 'customer',
      full_name: 'Sarah Connor',
      phone: '+91-91234-56789',
      avatar_url: 'avatar-4',
    });

    console.log('👤 Seeded RBAC Demo Accounts.');

    // 4. Seed Promotional Coupons
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    await Coupon.create([
      { code: 'WELCOME10', discount_percent: 10, discount_percentage: 10, valid_until: nextYear, is_active: true },
      { code: 'SUMMER20', discount_percent: 20, discount_percentage: 20, valid_until: nextYear, is_active: true },
      { code: 'LUXURY25', discount_percent: 25, discount_percentage: 25, valid_until: nextYear, is_active: true },
    ]);
    console.log('🎟️ Seeded promotional discount coupons.');

    // 5. Seed Rooms for Hotels
    const roomDelhi1 = await Room.create({
      hotel: hotel1._id,
      name: 'Paradise Imperial Suite',
      description: 'Lavish master bedroom with panoramic city skyline view, marble bathroom with jacuzzi, and personal butler service.',
      price_per_night: 9500,
      capacity: 3,
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'],
      amenities: ['King Bed', 'City View', 'Jacuzzi', 'Butler Service', 'Free WiFi', 'Breakfast Included'],
      total_units: 5,
    });

    const roomDelhi2 = await Room.create({
      hotel: hotel1._id,
      name: 'Paradise Deluxe Executive',
      description: 'Sophisticated comfort with high-speed internet, ergonomic workspace, and luxury bedding.',
      price_per_night: 5500,
      capacity: 2,
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427'],
      amenities: ['Queen Bed', 'Work Desk', 'Mini Bar', 'High-Speed WiFi'],
      total_units: 10,
    });

    const roomDelhi3 = await Room.create({
      hotel: hotel1._id,
      name: 'Paradise Heritage Suite',
      description: 'Colonial charm meets modern luxury with teakwood furniture and private balcony.',
      price_per_night: 7500,
      capacity: 2,
      images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39'],
      amenities: ['King Bed', 'Private Balcony', 'Bathtub', 'Lounge Access'],
      total_units: 4,
    });

    const roomGoa1 = await Room.create({
      hotel: hotel2._id,
      name: 'Paradise Oceanfront Villa',
      description: 'Step directly onto the golden sands of Calangute with a private plunge pool and sun deck.',
      price_per_night: 12000,
      capacity: 4,
      images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9'],
      amenities: ['Sea View', 'Plunge Pool', 'Sun Deck', 'King Bed', 'Breakfast Included'],
      total_units: 3,
    });

    await Room.create([
      {
        hotel: hotel2._id,
        name: 'Paradise Tropical Garden Suite',
        description: 'Peaceful tropical garden view with private veranda and outdoor rain shower.',
        price_per_night: 6500,
        capacity: 2,
        images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef'],
        amenities: ['Garden View', 'Veranda', 'Rain Shower', 'WiFi'],
        total_units: 8,
      },
      {
        hotel: hotel3._id,
        name: 'Paradise Maharaja Royal Suite',
        description: 'Authentic royal living with ornate frescoes, vintage chandeliers, and courtyard view.',
        price_per_night: 14500,
        capacity: 2,
        images: ['https://images.unsplash.com/photo-1595576508898-0ad5c879a061'],
        amenities: ['Courtyard View', 'Royal Decor', 'Four-poster Bed', 'Personal Valet'],
        total_units: 2,
      },
      {
        hotel: hotel4._id,
        name: 'Paradise Presidential Sea View Suite',
        description: 'Spectacular panoramic ocean views with separate dining and master quarters.',
        price_per_night: 18000,
        capacity: 3,
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'],
        amenities: ['Sea View', 'Dining Room', 'Jacuzzi', 'Express Checkin'],
        total_units: 4,
      },
      {
        hotel: hotel5._id,
        name: 'Paradise Royal Lake View Suite',
        description: 'Overlooking shimmering Lake Pichola with traditional Rajasthani jharokhas.',
        price_per_night: 16500,
        capacity: 2,
        images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843'],
        amenities: ['Lake View', 'Private Balcony', 'Butler', 'Spa Access'],
        total_units: 3,
      },
      {
        hotel: hotel6._id,
        name: 'Paradise Himalayan Cedar Chalet',
        description: 'Warm cedar wood architecture with private fireplace and snow peak vistas.',
        price_per_night: 8500,
        capacity: 4,
        images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a'],
        amenities: ['Fireplace', 'Mountain View', 'Heater', 'Balcony', 'Breakfast'],
        total_units: 6,
      },
    ]);

    console.log('🛏️ Seeded rooms across all 6 PARADISE Palace hotels.');

    // 6. Seed Diverse Live Reservations
    await Booking.create([
      {
        hotel: hotel1._id,
        room: roomDelhi1._id,
        user: customerUser._id,
        check_in_date: '2026-08-10',
        check_out_date: '2026-08-14',
        total_price: 38000,
        status: 'confirmed',
        guest_name: 'Sarah Connor',
        guest_email: 'customer@gmail.com',
        guest_phone: '+91-91234-56789',
        payment_status: 'paid',
        coupon_code: 'WELCOME10',
        discount_applied: 3800,
      },
      {
        hotel: hotel1._id,
        room: roomDelhi2._id,
        user: null,
        check_in_date: '2026-08-03',
        check_out_date: '2026-08-07',
        total_price: 22000,
        status: 'checked_in',
        guest_name: 'Vikramaditya Roy',
        guest_email: 'vikram.roy@techcorp.in',
        guest_phone: '+91-98111-22334',
        payment_status: 'paid',
      },
      {
        hotel: hotel1._id,
        room: roomDelhi3._id,
        user: null,
        check_in_date: '2026-08-01',
        check_out_date: '2026-08-03',
        total_price: 15000,
        status: 'checked_out',
        guest_name: 'Aanya Mehra',
        guest_email: 'aanya.m@travelhub.com',
        guest_phone: '+91-99222-33445',
        payment_status: 'paid',
      },
      {
        hotel: hotel2._id,
        room: roomGoa1._id,
        user: null,
        check_in_date: '2026-08-20',
        check_out_date: '2026-08-25',
        total_price: 60000,
        status: 'confirmed',
        guest_name: 'Rohan Gupta',
        guest_email: 'rohan.gupta@fintech.io',
        guest_phone: '+91-98765-99887',
        payment_status: 'paid',
        coupon_code: 'SUMMER20',
        discount_applied: 12000,
      },
    ]);
    console.log('📅 Seeded demo reservations.');

    console.log('✅ PARADISE Palace Hotels database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
