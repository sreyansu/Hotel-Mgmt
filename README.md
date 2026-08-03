# 🏨 PARADISE Palace Hotels - Hotel Management & Booking System

A full-stack Hotel Booking & Management platform built with **React (Vite)**, **Node.js / Express**, and **MongoDB (Mongoose)** featuring unified **Role-Based Access Control (RBAC)** and specialized operational dashboards.

---

## 🌟 Key Highlights

- **Specialized Operational Dashboards (`/admin`):**
  - **Front Desk Operations Desk:** Real-time Room Board (Rooms 101–304) with Housekeeping Status cyclers (`Clean`, `Dirty`, `Cleaning`), live guest arrival/departure queues, room key assignment, and special concierge requests.
  - **Hotel Manager Portal:** Executive financial performance analytics (Occupancy % gauge, Total Property Revenue, Average Daily Rate / ADR), Dynamic Suite Pricing Controller (+₹500 / -₹500 surge rate adjusters), and inventory controls.
  - **Super Admin Command Center:** Multi-hotel portfolio overview across India (6 luxury properties), Global reservations master ledger, promo discount campaigns, and RBAC team provisioning.
- **Unified Customer Portal:** Browse luxury resorts across India (Delhi, Goa, Jaipur, Mumbai, Udaipur, Manali), apply real-time discount coupons, and view booking history in `My Bookings` (`/bookings`).
- **Two-Step Role Selection Auth:** Clean single-row role selector on `/login` with instant demo credentials for rapid testing.
- **MongoDB & Mongoose Architecture:** Clean NoSQL document schemas for Users, Hotels, Rooms, Bookings, and Coupons.
- **JWT & RBAC Security:** Express middleware pipeline (`authenticate` + `authorizeRoles`) enforcing strict access tiers.

---

## 📁 Project Structure

```
Hotel-Mgmt/
├── apps/
│   └── booking/               # React + Vite Frontend
│       ├── src/
│       │   ├── components/    # Reusable UI components & ProtectedRoute
│       │   ├── hooks/         # useAuth hook with global AuthContext
│       │   ├── lib/           # Centralized API client (api.ts)
│       │   └── pages/         # AdminDashboardPage, HotelListingPage, HotelDetailsPage, LoginPage, etc.
│       ├── package.json
│       └── vite.config.ts
├── server/                    # Node.js + Express + MongoDB Backend
│   ├── config/                # MongoDB connection setup
│   ├── middleware/            # JWT authentication & authorizeRoles (RBAC)
│   ├── models/                # User, Hotel, Room, Booking, Coupon schemas
│   ├── routes/                # REST API endpoints (Auth, Hotels, Bookings, Coupons)
│   ├── seed.js                # Database seeder with 6 properties, rooms, 4 demo accounts & coupons
│   ├── server.js              # Express app entry point (Port 5001)
│   └── package.json
├── context.md                 # System Architecture & Context Documentation
├── api_routes.md              # Complete REST API reference & test payloads
├── server.md                  # Database Schemas & Mongoose Data Model
├── middleware.md              # Auth & Security Middleware deep dive
├── handsoff.md                # Project Handover & Setup Guide
└── interview_prep.md          # Technical Interview Preparation Guide
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI.

---

### 2. Running Backend & Frontend in Parallel

From the workspace root directory:

```bash
# 1. Start MongoDB (if not already running)
brew services start mongodb-community

# 2. Run both Backend & Frontend:
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5001/api`

---

## 🔑 Demo Credentials (Seeded)

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@grandhotels.com` | `admin@123` | Full Portfolio Admin Dashboard (`/admin`), Revenue Stats, Team Provisioning |
| **Hotel Manager** | `manager@grandhotels.com` | `manager@123` | Hotel Manager Portal (`/admin`), Dynamic Pricing, Occupancy % & ADR KPIs |
| **Front Desk Staff** | `staff@gmail.com` | `staff@123` | Front Desk Terminal (`/admin`), Room Status Board (101–304), Check-in Queue |
| **Customer** | `customer@gmail.com` | `customer@123` | Hotel Booking, Checkout, My Bookings (`/bookings`) |

---

## 🛡️ API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Authenticate & obtain JWT with role payload
- `GET /api/auth/me` - Fetch authenticated user profile
- `PUT /api/auth/profile` - Update user profile & avatar
- `POST /api/auth/admin/create-user` - Provision manager or staff account (*Super Admin*)

### Hotels & Rooms (`/api/hotels`)
- `GET /api/hotels` - List all active hotels with dynamic starting prices (Public)
- `GET /api/hotels/:slug` - Get hotel details and associated rooms (Public)
- `POST /api/hotels` - Create new property (*Super Admin / Manager*)
- `POST /api/hotels/rooms` - Create new room category (*Super Admin / Manager*)
- `PATCH /api/hotels/rooms/:id` - Dynamic room rate & inventory unit updates (*Super Admin / Manager*)
- `DELETE /api/hotels/rooms/:id` - Delete room suite (*Super Admin / Manager*)

### Bookings & Reservations (`/api/bookings`)
- `POST /api/bookings` - Create reservation & instant confirmation (Public / Customer)
- `GET /api/bookings/my-bookings` - Fetch customer's personal bookings (*Customer*)
- `GET /api/bookings/admin/all` - View all reservations across properties (*Admin / Staff*)
- `PATCH /api/bookings/admin/:id/status` - Update reservation status (*Admin / Staff*)
- `PATCH /api/bookings/admin/:id/details` - Assign room number & log concierge notes (*Admin / Staff*)

### Coupons & Discounts (`/api/coupons`)
- `POST /api/coupons/validate` - Validate promo code (Public)
- `GET /api/coupons/admin/all` - List all coupons (*Admin / Staff*)
- `POST /api/coupons/admin` - Create new coupon (*Super Admin*)
- `PATCH /api/coupons/admin/:code/toggle` - Toggle active/inactive (*Super Admin*)
