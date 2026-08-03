# PARADISE Palace Hotels REST API Reference Manual (`api_routes.md`)

Base URL: `http://localhost:5001/api`

---

## 1. Authentication & User Endpoints (`/api/auth`)

### 1.1 Register New Customer
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Description**: Registers a new customer. Restricted to the `customer` role only.
- **Request Body**:
```json
{
  "email": "sarah.connor@gmail.com",
  "password": "sarah@123",
  "full_name": "Sarah Connor",
  "phone": "+91-98765-00000"
}
```
- **Response** `201 Created`:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66b1...",
    "email": "sarah.connor@gmail.com",
    "role": "customer",
    "full_name": "Sarah Connor",
    "avatar_url": "avatar-1"
  }
}
```

---

### 1.2 User Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@grandhotels.com",
  "password": "admin@123"
}
```
- **Response** `200 OK`:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66b2...",
    "email": "admin@grandhotels.com",
    "role": "super_admin",
    "full_name": "System Administrator",
    "avatar_url": "avatar-1"
  }
}
```

---

### 1.3 Fetch Current Authenticated User (`/me`)
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response** `200 OK`:
```json
{
  "user": {
    "id": "66b2...",
    "email": "admin@grandhotels.com",
    "role": "super_admin",
    "full_name": "System Administrator",
    "phone": "+91-98765-43210",
    "avatar_url": "avatar-1"
  }
}
```

---

### 1.4 Update User Profile
- **Endpoint**: `PUT /api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "full_name": "Alexander Hamilton",
  "phone": "+91-99887-11223",
  "date_of_birth": "1992-05-18",
  "address": "45 Palace Road, New Delhi",
  "avatar_url": "avatar-5"
}
```
- **Response** `200 OK`:
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "66b2...",
    "email": "admin@grandhotels.com",
    "role": "super_admin",
    "full_name": "Alexander Hamilton",
    "avatar_url": "avatar-5"
  }
}
```

---

### 1.5 Provision Team Member (Super Admin Only)
- **Endpoint**: `POST /api/auth/admin/create-user`
- **Headers**: `Authorization: Bearer <super_admin_token>`
- **Request Body**:
```json
{
  "email": "concierge.goa@gmail.com",
  "password": "staff@123",
  "full_name": "Rahul Verma",
  "role": "staff",
  "hotel_id": "66b4...",
  "phone": "+91-832-1111-222"
}
```
- **Response** `201 Created`:
```json
{
  "message": "User account created successfully",
  "user": {
    "id": "66b3...",
    "email": "concierge.goa@gmail.com",
    "role": "staff",
    "full_name": "Rahul Verma",
    "hotel_id": "66b4..."
  }
}
```

---

## 2. Hotels & Room Inventory Endpoints (`/api/hotels`)

### 2.1 Get All Hotels with Dynamic Starting Price
- **Endpoint**: `GET /api/hotels`
- **Access**: Public
- **Response** `200 OK`:
```json
{
  "hotels": [
    {
      "id": "66b4...",
      "name": "Grand Imperial Hotel",
      "slug": "grand-imperial-delhi",
      "address": "Connaught Place, New Delhi, 110001",
      "rating": 4.9,
      "starting_price": 5500,
      "images": ["https://images.unsplash.com/..."],
      "amenities": ["Pool", "Spa", "Gym", "WiFi", "Fine Dining"]
    }
  ]
}
```

---

### 2.2 Get Hotel Property Details & Rooms by Slug
- **Endpoint**: `GET /api/hotels/:slug`
- **Access**: Public
- **Response** `200 OK`:
```json
{
  "hotel": {
    "id": "66b4...",
    "name": "Grand Imperial Hotel",
    "slug": "grand-imperial-delhi",
    "rooms": [
      {
        "id": "66b5...",
        "name": "Imperial Suite",
        "price_per_night": 9500,
        "capacity": 2,
        "amenities": ["King Bed", "Bathtub", "City View"]
      }
    ]
  }
}
```

---

### 2.3 Create New Hotel Property (Admin / Manager)
- **Endpoint**: `POST /api/hotels`
- **Headers**: `Authorization: Bearer <admin_or_manager_token>`
- **Request Body**:
```json
{
  "name": "Grand Oceanfront Resort",
  "slug": "grand-oceanfront-resort",
  "address": "Candolim Beach, North Goa, 403515",
  "description": "Exclusive beachfront luxury resort with private villas.",
  "rating": 4.9,
  "images": ["https://images.unsplash.com/..."],
  "amenities": ["Infinity Pool", "Private Beach", "Ayurvedic Spa"],
  "contact_email": "candolim@grandpalace.com",
  "contact_phone": "+91-832-9999-888"
}
```
- **Response** `201 Created`:
```json
{
  "message": "Hotel created successfully",
  "hotel": { "id": "66b6...", "name": "Grand Oceanfront Resort" }
}
```

---

### 2.4 Create Room Category (Admin / Manager)
- **Endpoint**: `POST /api/hotels/rooms`
- **Headers**: `Authorization: Bearer <admin_or_manager_token>`
- **Request Body**:
```json
{
  "hotel_id": "66b4...",
  "name": "Presidential Penthouse",
  "description": "Top-floor penthouse with private terrace and jacuzzi.",
  "price_per_night": 22000,
  "capacity": 4,
  "total_units": 2,
  "amenities": ["Jacuzzi", "Private Terrace", "Personal Chef"],
  "images": ["https://images.unsplash.com/..."]
}
```
- **Response** `201 Created`:
```json
{
  "message": "Room created successfully",
  "room": { "id": "66b7...", "name": "Presidential Penthouse" }
}
```

---

### 2.5 Dynamic Room Rate & Inventory Unit Update (Admin / Manager)
- **Endpoint**: `PATCH /api/hotels/rooms/:id`
- **Headers**: `Authorization: Bearer <admin_or_manager_token>`
- **Request Body**:
```json
{
  "price_per_night": 12500,
  "total_units": 8
}
```
- **Response** `200 OK`:
```json
{
  "message": "Room suite updated successfully",
  "room": {
    "id": "66b7...",
    "name": "Presidential Penthouse",
    "price_per_night": 12500,
    "total_units": 8
  }
}
```

---

### 2.6 Delete Room Suite (Admin / Manager)
- **Endpoint**: `DELETE /api/hotels/rooms/:id`
- **Headers**: `Authorization: Bearer <admin_or_manager_token>`
- **Response** `200 OK`:
```json
{
  "message": "Room deleted successfully"
}
```

---

## 3. Booking & Reservation Endpoints (`/api/bookings`)

### 3.1 Create Reservation
- **Endpoint**: `POST /api/bookings`
- **Headers**: Optional `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "hotel_id": "66b4...",
  "room_id": "66b5...",
  "check_in_date": "2026-09-01",
  "check_out_date": "2026-09-05",
  "total_price": 38000,
  "guest_name": "Rohan Sharma",
  "guest_email": "rohan.sharma@example.com",
  "guest_phone": "+91-98765-43210",
  "coupon_code": "WELCOME10",
  "discount_applied": 3800
}
```
- **Response** `201 Created`:
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": "66b8...",
    "status": "confirmed",
    "payment_status": "paid",
    "total_price": 34200
  }
}
```

---

### 3.2 Update Booking Status (Admin & Staff)
- **Endpoint**: `PATCH /api/bookings/admin/:id/status`
- **Headers**: `Authorization: Bearer <staff_or_admin_token>`
- **Request Body**:
```json
{
  "status": "checked_in"
}
```
- **Response** `200 OK`:
```json
{
  "message": "Booking status updated successfully",
  "booking": { "id": "66b8...", "status": "checked_in" }
}
```

---

### 3.3 Update Booking Details: Room Number & Concierge Requests (Front Desk & Staff)
- **Endpoint**: `PATCH /api/bookings/admin/:id/details`
- **Headers**: `Authorization: Bearer <staff_or_admin_token>`
- **Request Body**:
```json
{
  "room_number": "204",
  "special_requests": "Late check-in requested at 11 PM. Extra feather pillows."
}
```
- **Response** `200 OK`:
```json
{
  "message": "Booking details updated successfully",
  "booking": {
    "id": "66b8...",
    "room_number": "204",
    "special_requests": "Late check-in requested at 11 PM. Extra feather pillows."
  }
}
```

---

## 4. Coupons & Promotion Endpoints (`/api/coupons`)

### 4.1 Validate Coupon Code
- **Endpoint**: `POST /api/coupons/validate`
- **Request Body**:
```json
{
  "code": "WELCOME10"
}
```
- **Response** `200 OK`:
```json
{
  "valid": true,
  "discount_percentage": 10,
  "discount_percent": 10,
  "code": "WELCOME10",
  "message": "Coupon applied successfully"
}
```

---

### 4.2 Create New Coupon (Admin Only)
- **Endpoint**: `POST /api/coupons/admin`
- **Headers**: `Authorization: Bearer <super_admin_token>`
- **Request Body**:
```json
{
  "code": "MONSOON40",
  "discount_percentage": 40,
  "valid_until": "2026-10-31"
}
```
- **Response** `201 Created`:
```json
{
  "message": "Coupon created successfully",
  "coupon": { "code": "MONSOON40", "discount_percentage": 40, "is_active": true }
}
```
