# PARADISE Palace Hotels Platform — Handover & Project Guide (`handsoff.md`)

## 1. Quick Start & Execution

### Running the Entire Application:
From the repository root `/Users/sreyansusekharmohanty/Hotel-Mgmt`:

```bash
# 1. Start MongoDB (if not running)
brew services start mongodb-community

# 2. Run both Backend and Frontend in parallel:
npm run dev
```

- **Client App URL**: `http://localhost:5173`
- **REST API URL**: `http://localhost:5001/api`

---

## 2. Pre-Seeded Demonstration Accounts & Tailored Dashboards

The database includes 4 pre-configured RBAC roles ready for testing or live interview presentation:

| Role | Email | Password | Access Area | Tailored Dashboard & Capabilities |
|---|---|---|---|---|
| **Front Desk Staff** | `staff@gmail.com` | `staff@123` | `/admin` (Front Desk Terminal) | **Live Operations**: Real-time Room Board (101–304), 1-click Housekeeping Status toggles (`Clean`, `Dirty`, `Cleaning`), guest arrival/departure queue, room key assignment, and concierge request logger. |
| **Hotel Manager** | `manager@paradisepalace.com` | `manager@123` | `/admin` (Manager Portal) | **Financial Strategy & Inventory**: Property Occupancy Rate % gauge, Total Revenue, Average Daily Rate (ADR), dynamic surge/discount rate adjustments (+₹500 / -₹500) with live API sync, and inventory capacity controls. |
| **Super Admin** | `admin@paradisepalace.com` | `admin@123` | `/admin` (Command Center) | **Enterprise Platform Oversight**: Multi-hotel portfolio management (6 properties), Global bookings master ledger, Promo coupon campaigns, and RBAC team provisioning. |
| **Customer** | `customer@gmail.com` | `customer@123` | `/bookings`, `/` | **Guest Self-Service**: Browse luxury hotels, check availability, apply promo discount codes, reserve suites, and view booked stay history. |

> **Tip**: On the `/login` page, select any of the 4 horizontal role cards to autofill demo credentials and reveal the respective authentication section.

---

## 3. Seeded Promotional Discount Codes

| Promo Code | Discount | Status | Notes |
|---|---|---|---|
| `WELCOME10` | **10% OFF** | Active | Available for new guests |
| `SUMMER20` | **20% OFF** | Active | Seasonal promotion |
| `LUXURY25` | **25% OFF** | Active | VIP promo code |

---

## 4. Key Architectural Features Implemented

1. **Two-Step Role-First Authentication Portal**:
   - Clean horizontal single-row role selector (`Super Admin`, `Hotel Manager`, `Front Desk`, `Customer`).
   - Dynamic reveal of Sign In or Customer Account Creation upon role selection.
   - Public account creation strictly restricted to the `customer` role.
2. **Distinct Three-Tier Administrative Dashboards**:
   - **Front Desk View**: Interactive Room Grid (101–304), Live Arrival/Departure queues, Housekeeping status cycler (`clean` $\rightarrow$ `dirty` $\rightarrow$ `cleaning`), Room Key assignment, and Concierge Notes modal.
   - **Hotel Manager View**: High-level KPI metrics (Occupancy %, ADR, Revenue), Dynamic Suite Pricing Controller with $+500/-500$ real-time adjustments, and suite capacity controls.
   - **Super Admin View**: Multi-property portfolio management across India, system revenue, team provisioning, and promo campaigns.
3. **Curated Person-Like SVG Avatar System**:
   - 6 custom SVG person avatars (Alexander - Executive, Sophia - Luxury Traveler, Vikram - Concierge, Maya - Vacationer, Elena - Modern Elite, Lucas - Member).
4. **Hotel & Room Inventory Engine**:
   - 6 Luxury Properties across India (Delhi, Goa, Jaipur, Mumbai, Udaipur, Manali).
   - Real-time starting price aggregation in Indian Rupees (`₹`).
   - Add Hotel Property and Add Room Suite modals.
5. **Team & Staff Provisioning**:
   - Super Admin can provision Hotel Managers and Front Desk Staff bound to specific hotel properties.
6. **Robust Error Handling & Security**:
   - Express middleware catching unauthorized access with 401/403 responses.
   - Real-time password strength validation on registration.

---

## 5. Re-Seeding the Database

If you want to reset all records to the original clean demo state at any time:

```bash
cd server
node seed.js
```
