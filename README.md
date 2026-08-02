# 🏨 Grand Palace - Hotel Management & Booking System

A full-stack Hotel Booking & Management platform built with **React (Vite)**, **Node.js / Express**, and **MongoDB (Mongoose)** featuring unified **Role-Based Access Control (RBAC)**.

---

## 🌟 Key Highlights

- **Unified Admin & Customer App:** A single frontend application where administrative controls (`/admin`) and customer interfaces seamlessly coexist, protected by strict client-side Route Guards and server-side JWT RBAC middleware.
- **MongoDB & Mongoose Architecture:** Clean, scalable NoSQL document schemas for Users, Hotels, Rooms, Bookings, and Coupons.
- **JWT & Role-Based Access Control:** Secure authentication supporting 4 distinct roles:
  - `super_admin`: Full system control, property management, coupon generation, reservation overrides.
  - `hotel_manager`: Hotel & room inventory management, booking status updates.
  - `staff`: Guest check-in/check-out operations and booking lookup.
  - `customer`: Browse luxury resorts, apply discount promo codes, book rooms, and view personal reservations.
- **Real-Time Coupon Engine:** Instant discount calculation and validation engine (e.g., `WELCOME10`, `SUMMER20`, `LUXURY25`).
- **Modern Responsive UI:** Built with Tailwind CSS, Lucide icons, and React Day Picker.

---

## 📁 Project Structure

```
Hotel-Mgmt/
├── apps/
│   └── booking/               # React + Vite Frontend
│       ├── src/
│       │   ├── components/    # Reusable UI components & ProtectedRoute
│       │   ├── hooks/         # useAuth hook with role state
│       │   ├── lib/           # Centralized API client (api.ts)
│       │   └── pages/         # Landing, Listing, Details, Checkout, Admin, Auth
│       ├── package.json
│       └── vite.config.ts
└── server/                    # Node.js + Express + MongoDB Backend
    ├── config/                # MongoDB connection setup
    ├── middleware/            # JWT authentication & authorizeRoles (RBAC)
    ├── models/                # User, Hotel, Room, Booking, Coupon schemas
    ├── routes/                # REST API endpoints (Auth, Hotels, Bookings, Coupons)
    ├── seed.js                # Database seeder with demo accounts & properties
    ├── server.js              # Express app entry point
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI.

---

### 2. Backend Setup (`server/`)

```bash
cd server
npm install
node seed.js    # Populates sample hotels, rooms, coupons & admin/customer accounts
npm run dev     # Starts Express API on http://localhost:5001
```

---

### 3. Frontend Setup (`apps/booking/`)

```bash
cd apps/booking
npm install
npm run dev     # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Demo Credentials (Seeded)

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@grandpalace.com` | `admin123` | Full Admin Dashboard (`/admin`), Revenue Stats, Inventory, Coupons |
| **Customer** | `customer@example.com` | `customer123` | Hotel Booking, Checkout, My Reservations (`/bookings`) |

---

## 🛡️ API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Authenticate & obtain JWT with role payload
- `GET /api/auth/me` - Fetch authenticated user profile

### Hotels & Rooms (`/api/hotels`)
- `GET /api/hotels` - List all active hotels with starting prices (Public)
- `GET /api/hotels/:slug` - Get hotel details and associated rooms (Public)
- `GET /api/hotels/rooms/details/:id` - Get room by ID (Public)
- `GET /api/hotels/admin/rooms` - All rooms across portfolio (*Admin/Staff*)
- `POST /api/hotels` - Create property (*Super Admin/Manager*)
- `POST /api/hotels/rooms` - Create room (*Super Admin/Manager*)

### Bookings & Reservations (`/api/bookings`)
- `POST /api/bookings` - Create reservation & instant confirmation (Public/Customer)
- `GET /api/bookings/my-bookings` - Fetch customer's personal bookings (*Customer*)
- `GET /api/bookings/admin/all` - View all reservations across properties (*Admin/Staff*)
- `PATCH /api/bookings/admin/:id/status` - Update reservation status (*Admin/Staff*)

### Coupons & Discounts (`/api/coupons`)
- `GET /api/coupons/validate/:code` - Validate promo code (Public)
- `GET /api/coupons/admin/all` - List all coupons (*Admin/Staff*)
- `POST /api/coupons/admin` - Create new coupon (*Admin/Manager*)
- `PATCH /api/coupons/admin/:code/toggle` - Toggle active/inactive (*Admin/Manager*)
