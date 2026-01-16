-- SEED DATA FOR TESTING

-- 1. Grand Imperial Hotel (New Delhi) - High End
INSERT INTO public.hotels (id, slug, name, description, address, images, amenities, contact_email, contact_phone)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'grand-imperial-delhi',
    'Grand Imperial Hotel',
    'Experience imperial luxury in the capital. Close to historical monuments.',
    'Connaught Place, New Delhi, 110001',
    ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000&auto=format&fit=crop'],
    ARRAY['Pool', 'Spa', 'Gym', 'WiFi', 'Fine Dining'],
    'delhi@grandhotels.com',
    '+91-11-2222-3333'
) ON CONFLICT DO NOTHING;

INSERT INTO public.rooms (hotel_id, name, description, price_per_night, capacity, images, amenities, total_units) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Imperial Suite', 'Luxury suite with city view', 9500, 2, ARRAY['https://images.unsplash.com/photo-1631049307204-6c0ec7ebc952'], ARRAY['King Bed', 'Bathtub'], 5),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Deluxe Room', 'Spacious room for business', 5500, 2, ARRAY['https://images.unsplash.com/photo-1611892440504-42a792e24d32'], ARRAY['Queen Bed', 'Desk'], 10);

-- 2. Grand Seaview Resort (Goa) - Mid Range
INSERT INTO public.hotels (id, slug, name, description, address, images, amenities, contact_email, contact_phone)
VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    'grand-seaview-goa',
    'Grand Seaview Resort',
    'Relax by the beach in our grand resort.',
    'Calangute, Goa, 403516',
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000'],
    ARRAY['Beach Access', 'Pool', 'Bar', 'WiFi'],
    'goa@grandhotels.com',
    '+91-832-2222-3333'
) ON CONFLICT DO NOTHING;

INSERT INTO public.rooms (hotel_id, name, description, price_per_night, capacity, images, amenities, total_units) VALUES 
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Ocean Villa', 'Private villa facing the sea', 8000, 4, ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427'], ARRAY['Private Pool', 'Kitchenette'], 3),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Standard Room', 'Cozy room near the pool', 3500, 2, ARRAY['https://images.unsplash.com/photo-1560185007-cde436f6a4d0'], ARRAY['Twin Beds', 'Balcony'], 20);

-- 3. Grand Heritage Palace (Jaipur) - Luxury
INSERT INTO public.hotels (id, slug, name, description, address, images, amenities, contact_email, contact_phone)
VALUES (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
    'grand-heritage-jaipur',
    'Grand Heritage Palace',
    'Live like royalty in the pink city.',
    'Amer Road, Jaipur, 302002',
    ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'],
    ARRAY['Heritage Walk', 'Restaurant', 'WiFi'],
    'jaipur@grandhotels.com',
    '+91-141-2222-3333'
) ON CONFLICT DO NOTHING;

INSERT INTO public.rooms (hotel_id, name, description, price_per_night, capacity, images, amenities, total_units) VALUES 
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Royal Suite', 'Opulent decorative suite', 10000, 2, ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427'], ARRAY['Jacuzzi', 'King Bed'], 2),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Havel Room', 'Traditional rajasthani decor', 4500, 2, ARRAY['https://images.unsplash.com/photo-1611892440504-42a792e24d32'], ARRAY['Queen Bed'], 8);

-- 4. Grand Lake View (Nainital) - Budget/Mid
INSERT INTO public.hotels (id, slug, name, description, address, images, amenities, contact_email, contact_phone)
VALUES (
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
    'grand-lake-nainital',
    'Grand Lake View',
    'Peaceful stay overlooking Naini Lake.',
    'Mall Road, Nainital, 263002',
    ARRAY['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1'],
    ARRAY['Lake View', 'Heater', 'Restaurant'],
    'nainital@grandhotels.com',
    '+91-5942-2222-3333'
) ON CONFLICT DO NOTHING;

INSERT INTO public.rooms (hotel_id, name, description, price_per_night, capacity, images, amenities, total_units) VALUES 
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Lake Facing Room', 'Best view in town', 4000, 2, ARRAY['https://images.unsplash.com/photo-1512918760532-3ed64bc80e53'], ARRAY['Balcony', 'Heater'], 10),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Standard Room', 'Budget friendly comfort', 1500, 2, ARRAY['https://images.unsplash.com/photo-1560185007-cde436f6a4d0'], ARRAY['Queen Bed'], 15);

-- 5. Grand City Hotel (Bangalore) - Business
INSERT INTO public.hotels (id, slug, name, description, address, images, amenities, contact_email, contact_phone)
VALUES (
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
    'grand-city-bangalore',
    'Grand City Hotel',
    'Modern business hotel in Tech Hub.',
    'Indiranagar, Bangalore, 560038',
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
    ARRAY['Confrence Room', 'WiFi', 'Gym', 'Workstations'],
    'bangalore@grandhotels.com',
    '+91-80-2222-3333'
) ON CONFLICT DO NOTHING;

INSERT INTO public.rooms (hotel_id, name, description, price_per_night, capacity, images, amenities, total_units) VALUES 
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'Executive Room', 'Designed for productivity', 6000, 2, ARRAY['https://images.unsplash.com/photo-1611892440504-42a792e24d32'], ARRAY['Work Desk', 'Ergonomic Chair'], 20),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'Club Room', 'Access to club lounge', 8500, 2, ARRAY['https://images.unsplash.com/photo-1631049307204-6c0ec7ebc952'], ARRAY['Lounge Access', 'Breakfast'], 10);

-- 6. Grand Mountain Lodge (Darjeeling) - Cozy
INSERT INTO public.hotels (id, slug, name, description, address, images, amenities, contact_email, contact_phone)
VALUES (
    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
    'grand-mountain-darjeeling',
    'Grand Mountain Lodge',
    'Wake up to Kanchenjunga views.',
    'Gandhi Road, Darjeeling, 734101',
    ARRAY['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1'],
    ARRAY['Tea Garden', 'Heater', 'WiFi'],
    'darjeeling@grandhotels.com',
    '+91-354-2222-3333'
) ON CONFLICT DO NOTHING;

INSERT INTO public.rooms (hotel_id, name, description, price_per_night, capacity, images, amenities, total_units) VALUES 
('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'View Room', 'Direct mountain view', 5000, 2, ARRAY['https://images.unsplash.com/photo-1512918760532-3ed64bc80e53'], ARRAY['Heater', 'Kettle'], 8),
('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'Attic Room', 'Cozy wooden attic', 2500, 2, ARRAY['https://images.unsplash.com/photo-1560185007-cde436f6a4d0'], ARRAY['Queen Bed'], 5);

-- 7. Grand Riverside (Rishikesh) - Adventure
INSERT INTO public.hotels (id, slug, name, description, address, images, amenities, contact_email, contact_phone)
VALUES (
    '77eebc99-9c0b-4ef8-bb6d-6bb9bd380a07',
    'grand-riverside-rishikesh',
    'Grand Riverside',
    'Adventure meets spiritual peace by the Ganges.',
    'Tapovan, Rishikesh, 249192',
    ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'],
    ARRAY['Yoga Hall', 'River Rafting', 'Veg Dining'],
    'rishikesh@grandhotels.com',
    '+91-135-2222-3333'
) ON CONFLICT DO NOTHING;

INSERT INTO public.rooms (hotel_id, name, description, price_per_night, capacity, images, amenities, total_units) VALUES 
('77eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'River Suite', 'Sound of different Ganges', 7500, 3, ARRAY['https://images.unsplash.com/photo-1631049307204-6c0ec7ebc952'], ARRAY['Balcony', 'Yoga Mat'], 6),
('77eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'Tents', 'Luxury glamping', 2000, 2, ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427'], ARRAY['Shared Bath', 'Bonfire'], 15);

-- 8. Grand Cultural Stay (Chennai) - Standard
INSERT INTO public.hotels (id, slug, name, description, address, images, amenities, contact_email, contact_phone)
VALUES (
    '88eebc99-9c0b-4ef8-bb6d-6bb9bd380a08',
    'grand-cultural-chennai',
    'Grand Cultural Stay',
    'Traditional south indian hospitality.',
    'T Nagar, Chennai, 600017',
    ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'],
    ARRAY['Veg Restaurant', 'Temple Tours', 'WiFi'],
    'chennai@grandhotels.com',
    '+91-44-2222-3333'
) ON CONFLICT DO NOTHING;

INSERT INTO public.rooms (hotel_id, name, description, price_per_night, capacity, images, amenities, total_units) VALUES 
('88eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'Classic Room', 'Simple elegant room', 3000, 2, ARRAY['https://images.unsplash.com/photo-1611892440504-42a792e24d32'], ARRAY['AC', 'TV'], 20),
('88eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'Family Suite', 'Two connecting rooms', 5500, 4, ARRAY['https://images.unsplash.com/photo-1560185007-cde436f6a4d0'], ARRAY['Provisions for 4'], 5);

-- 9. Grand Metro (Kolkata) - City
INSERT INTO public.hotels (id, slug, name, description, address, images, amenities, contact_email, contact_phone)
VALUES (
    '99eebc99-9c0b-4ef8-bb6d-6bb9bd380a09',
    'grand-metro-kolkata',
    'Grand Metro',
    'Vintage charm in the city of joy.',
    'Park Street, Kolkata, 700016',
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
    ARRAY['Bar', 'Live Music', 'WiFi'],
    'kolkata@grandhotels.com',
    '+91-33-2222-3333'
) ON CONFLICT DO NOTHING;

INSERT INTO public.rooms (hotel_id, name, description, price_per_night, capacity, images, amenities, total_units) VALUES 
('99eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'Vintage Room', 'Colonial style furniture', 4000, 2, ARRAY['https://images.unsplash.com/photo-1631049307204-6c0ec7ebc952'], ARRAY['High Ceiling', 'King Bed'], 12),
('99eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'Suite', 'Modern amenities with vintage look', 7000, 2, ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427'], ARRAY['Bathtub'], 4);

-- 10. Grand Desert Camp (Jaisalmer) - Unique
INSERT INTO public.hotels (id, slug, name, description, address, images, amenities, contact_email, contact_phone)
VALUES (
    '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a10',
    'grand-desert-jaisalmer',
    'Grand Desert Camp',
    'Under the stars in the Thar desert.',
    'Sam Sand Dunes, Jaisalmer, 345001',
    ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'],
    ARRAY['Camel Safari', 'Folk Dance', 'Buffet'],
    'jaisalmer@grandhotels.com',
    '+91-2992-2222-3333'
) ON CONFLICT DO NOTHING;

INSERT INTO public.rooms (hotel_id, name, description, price_per_night, capacity, images, amenities, total_units) VALUES 
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Swiss Tent', 'Attached bathroom tent', 3500, 2, ARRAY['https://images.unsplash.com/photo-1512918760532-3ed64bc80e53'], ARRAY['AC', 'Attached Bath'], 30),
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Mud Cottage', 'Local architecture', 5000, 2, ARRAY['https://images.unsplash.com/photo-1560185007-cde436f6a4d0'], ARRAY['Cool', 'Spacious'], 10);


-- COUPONS
INSERT INTO public.coupons (code, discount_percent, is_active) VALUES
('ILIKE99', 99, true),
('TEST98', 98, true)
ON CONFLICT (code) DO NOTHING;
