# Technical Interview Preparation Guide (`interview_prep.md`)

## 1. How to Pitch This Project (30-Second Elevator Pitch)

> *"I built **PARADISE Palace Hotels**, a full-stack hotel reservation and property management platform using React 18, Vite, Node.js, Express, and MongoDB. The platform features an enterprise Role-Based Access Control (RBAC) system supporting four distinct user personas: Super Admins, Hotel Managers, Front Desk Staff, and Customers.*
>
> *Key technical highlights include distinct tactical Front Desk operations vs strategic Hotel Manager dashboards, dynamic room suite pricing controls (+₹500/-₹500 surge rate adjusters), real-time interactive room status boards (Rooms 101–304) with housekeeping cyclers, promo coupon validation with atomic discount calculations, JWT authentication with higher-order Express authorization middleware, and an internal staff provisioning engine."*

---

## 2. Core Architecture & Database Questions

### Q1: Why did you choose MongoDB over a relational database like PostgreSQL for this project?
**Answer**:
- **Document Flexibility**: Hospitality properties possess heterogeneous amenities, dynamic image arrays, and seasonal configurations. A document model natively stores amenities (`['Pool', 'Spa', 'WiFi']`) and image arrays as first-class arrays without requiring multi-table junction joins (`hotel_amenities_bridge`).
- **Read-Heavy Query Performance**: Browsing hotels with starting room prices is the most frequent query in the system. MongoDB's embedding and referencing capabilities allow single-query page loads with minimal overhead.
- **Rapid Prototyping & Schema Evolution**: Adding new fields (such as curated person SVG avatars, physical room number assignments, or special concierge notes) requires zero disruptive DDL table migrations.

---

### Q2: Embedded Documents vs. Object References — What was your schema design strategy?
**Answer**:
- **Referencing (`ObjectId` with `ref`)** was used for high-cardinality and independently queried entities:
  - `Booking -> Hotel, Room, User`: Bookings grow indefinitely. Embedding all bookings inside a `Hotel` document would violate MongoDB's 16MB document limit and cause severe document growth fragmentation.
  - `Room -> Hotel`: Rooms need independent updates (pricing adjustments, inventory unit updates) without locking the parent `Hotel` document.
- **Embedding** was used for tight-coupling and bounded-cardinality attributes:
  - `amenities: [String]` and `images: [String]` inside `Hotel` and `Room` schemas since they are always fetched together during hotel detail rendering.

---

### Q3: What MongoDB indexes did you or would you establish to ensure sub-millisecond query performance?
**Answer**:
1. **Compound Index for Room Availability & Pricing**:
   ```javascript
   roomSchema.index({ hotel: 1, price_per_night: 1 });
   ```
   *Rationale*: Accelerates queries filtering rooms by property sorted by price.
2. **Booking Date Range & Status Index**:
   ```javascript
   bookingSchema.index({ hotel: 1, check_in_date: 1, check_out_date: 1, status: 1 });
   ```
   *Rationale*: Rapidly computes room overlap and occupancy for Front Desk queues without full collection scans.
3. **Unique Index on User & Coupon**:
   ```javascript
   userSchema.index({ email: 1 }, { unique: true });
   couponSchema.index({ code: 1 }, { unique: true });
   ```
   *Rationale*: Enforces database-level uniqueness and $O(1)$ point-lookups for login and checkout.

---

## 3. RBAC, Security & API Design

### Q4: How did you differentiate the Front Desk dashboard from the Hotel Manager dashboard?
**Answer**:
- **Front Desk (Tactical Operations)**:
  - Focuses on real-time guest flow: arrivals, departures, in-house guests, and ready rooms.
  - Implements an interactive Room Board (Rooms 101–304) with dynamic housekeeping clean/dirty/cleaning cycle toggles.
  - Provides quick room key assignment, guest concierge request logging, and 1-click Check-in / Check-out actions.
- **Hotel Operations Manager (Strategic Financials & Inventory)**:
  - Focuses on high-level property metrics: **Occupancy Rate %** gauge, **Total Property Revenue**, and **Average Daily Rate (ADR)**.
  - Includes a Dynamic Pricing & Capacity Controller allowing managers to apply surge/discount rates (`+500`, `-500`) with instant backend persistence (`PATCH /api/hotels/rooms/:id`).
  - Scoped strictly to their assigned property (`req.user.hotel_id`).

---

### Q5: How did you implement Role-Based Access Control (RBAC) in Express?
**Answer**:
- Implemented a two-tiered middleware pipeline in `server/middleware/auth.js`:
  1. `authenticate`: Verifies the incoming `Authorization: Bearer <token>` using `jsonwebtoken`, checks user existence in MongoDB, and attaches the sanitized `req.user` object.
  2. `authorizeRoles(...roles)`: A higher-order function that acts as a closure, returning an Express middleware that checks if `allowedRoles.includes(req.user.role)`.
- If an unauthorized user attempts an action (e.g., a customer calling `POST /api/hotels`), the middleware intercepts the request immediately with a `403 Forbidden` response without touching the database controller.

---

### Q6: How do you prevent multi-tenant data leaks between different Hotel Managers? (Property Scoping)
**Answer**:
- Super Admins have unrestricted multi-property access (`hotel_id === null`).
- For `hotel_manager` and `staff`, all mutation and query routes enforce **property scoping**:
  ```javascript
  // In bookingRoutes.js / hotelRoutes.js
  if (req.user.role === 'hotel_manager' || req.user.role === 'staff') {
    if (!req.user.hotel_id || req.user.hotel_id.toString() !== targetHotelId.toString()) {
      return res.status(403).json({ message: 'Forbidden: You cannot manage properties other than your assigned hotel.' });
    }
  }
  ```
- This guarantees a Manager in Goa cannot modify rates or view guest manifests for New Delhi.

---

### Q7: How do you prevent sensitive data leaks (e.g. password hashes) in API responses?
**Answer**:
1. **Schema-Level Exclusion**: Marked password fields with `select: false` or explicitly excluded them in Mongoose queries:
   ```javascript
   const user = await User.findById(id).select('-password');
   ```
2. **Transform in `toJSON`**: Configured Mongoose schema options to strip `password` and `__v` automatically whenever documents are serialized to JSON:
   ```javascript
   userSchema.set('toJSON', {
     transform: (doc, ret) => {
       delete ret.password;
       delete ret.__v;
       return ret;
     }
   });
   ```

---

### Q8: How would you protect JWT tokens against XSS and CSRF attacks in production?
**Answer**:
- **Current Development Setup**: Stores JWT in `localStorage` for fast development and stateless testing.
- **Production Hardening Strategy**:
  1. **Store JWT in `httpOnly`, `Secure`, `SameSite=Strict` Cookie**: Prevents JavaScript access, eliminating token theft via Cross-Site Scripting (XSS).
  2. **CSRF Protection**: Use Custom Request Headers (`X-Requested-With: XMLHttpRequest` or double-submit CSRF tokens) so cross-origin form posts cannot execute authenticated mutations.
  3. **Short-Lived Access Tokens + Refresh Token Rotation**: Issue short-lived access tokens (15 minutes) and store hashed refresh tokens in MongoDB to allow instant session revocation.

---

## 4. Frontend Architecture & React 18 Patterns

### Q9: How is state managed on the React frontend to prevent UI desynchronization upon login/logout?
**Answer**:
- Implemented an `AuthContext` with a dedicated `useAuth()` hook in `apps/booking/src/hooks/useAuth.tsx`.
- The `AuthProvider` wraps the entire component tree in `App.tsx`.
- On application mount, it automatically inspects `localStorage.getItem('token')` and calls `/api/auth/me` to hydrate the authenticated user's state.
- Components like `Navbar.tsx` and `AdminDashboardPage.tsx` consume `useAuth()` directly, allowing instant reactive updates to the header links, avatar display, and dashboard tables without requiring full browser reloads.

---

### Q10: How do you prevent "Flash of Unauthenticated Content" (FOUC) and unauthorized route access in React Router?
**Answer**:
- Implemented a reusable `<ProtectedRoute>` component:
  ```tsx
  export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
      return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };
  ```
- While `loading === true`, the router renders a sleek loading spinner rather than flashing login or dashboard views.

---

### Q11: How did you implement real-time interactive UI like the Room Status Grid & Housekeeping cyclers without layout thrashing?
**Answer**:
- **Optimistic UI Updates**: When staff toggles a room status (`Clean` $\rightarrow$ `Dirty` $\rightarrow$ `Cleaning`), the local React state updates immediately so the UI responds in 0ms.
- **Background API Sync**: The state change triggers an asynchronous API patch (`PATCH /api/hotels/rooms/:id/status`) in the background. If the request fails, the state automatically reverts to the previous snapshot with a toast notification.
- **Pure Functional Components & Keys**: Assigned deterministic unique `key={room.room_number}` values to ensure React performs minimal DOM diffing without re-rendering the entire dashboard.

---

## 5. Payments, Concurrency & E-Commerce Logic

### Q12: How do you prevent overbooking / race conditions when two users book the last room simultaneously?
**Answer**:
In production, overbooking is solved using **atomic operations and optimistic concurrency control**:
1. **Mongoose Atomic Decrement**:
   ```javascript
   const room = await Room.findOneAndUpdate(
     { _id: roomId, total_units: { $gt: 0 } },
     { $inc: { total_units: -1 } },
     { new: true }
   );
   if (!room) {
     throw new Error('Room was booked by another guest just a moment ago.');
   }
   ```
2. **Distributed Locks (Redis Redlock)**: For high-throughput flash sales, a distributed lock keyed on `lock:room:${roomId}:${dateRange}` ensures only one booking transaction evaluates room inventory at a time.
3. **Database Transactions (`mongoose.startSession()`)**: Multi-document transactions guarantee that booking creation, payment verification, and room unit deduction execute atomically or roll back completely.

---

### Q13: How did you handle coupon validation and discount calculation?
**Answer**:
- Coupon codes are normalized to uppercase and validated via `POST /api/coupons/validate`.
- The server checks:
  1. Code existence in the `Coupon` collection.
  2. `is_active === true`.
  3. Expiry date check (`valid_until === null || new Date(valid_until) > new Date()`).
- On checkout, discount calculations happen **server-side** during `POST /api/bookings` to prevent malicious client-side price tampering.

---

### Q14: How would you integrate Razorpay/Stripe to handle webhooks and prevent double charges?
**Answer**:
1. **Order Creation**: Client calls backend `POST /api/payments/create-order`. Server creates an order with the payment provider and returns `order_id` and calculated amount.
2. **Client Checkout**: Client opens Razorpay/Stripe modal and completes checkout.
3. **Secure Webhook Verification**:
   - Webhook endpoint `POST /api/payments/webhook` parses raw payload with HMAC-SHA256 signature verification (`crypto.createHmac('sha256', secret)`).
   - Once verified, checks idempotency table: if `payment_id` is already processed, immediately return `200 OK`.
   - Transitions booking status to `confirmed` and `payment_status` to `paid` inside a database transaction.

---

## 6. System Architecture & Scenario-Based Questions

### Scenario 1: "A customer reports that they applied a coupon code, but their card was charged the full amount. How would you debug this?"
**Approach**:
1. **Inspect Network Request**: Check the client payload sent to `POST /api/bookings` in browser DevTools or server logs to verify `coupon_code` and `discount_applied` were included.
2. **Review Server-side Calculation**: Check if the backend recalculated `total_price = (price_per_night * nights) - discount` before finalizing the booking record.
3. **Database Inspection**: Query `db.bookings.findOne({ _id: bookingId })` to verify the stored `total_price`, `coupon_code`, and `discount_applied` fields.

---

### Scenario 2: "How would you scale this application to handle 100,000 daily active users?"
**Approach**:
1. **Frontend**: Deploy the static Vite React SPA on an edge CDN (Cloudflare / Netlify / Vercel) with asset caching and compression.
2. **Backend**: Containerize the Express server using Docker and deploy with Kubernetes / ECS behind an Application Load Balancer with auto-scaling.
3. **Database**:
   - Enable MongoDB replica sets (1 Primary for writes, multiple Secondaries with `readPreference: secondaryPreferred` for hotel searches).
   - Implement **Redis Caching** for static endpoints like `GET /api/hotels` and `GET /api/coupons` with a 5-minute TTL.
4. **Search**: Offload fuzzy search and geo-queries (e.g. "Hotels near Goa beaches") to **Elasticsearch** or **MongoDB Atlas Search**.

---

### Scenario 3: "A front desk staff member changes a room to 'Dirty', but another staff member assigns a check-in guest to the same room 5 seconds later. How do you prevent this operational conflict?"
**Approach**:
1. **WebSocket / Server-Sent Events (SSE)**: Implement real-time room status broadcasting using Socket.io. When Staff A updates Room 204 to 'Dirty', an event `room:status_updated` broadcasts to all connected front desk screens, instantly disabling the 'Assign' button.
2. **Server-Side Pre-condition Guard**: In `POST /api/bookings/:id/checkin`, verify that `room.housekeeping_status === 'clean'`. If dirty, reject with `409 Conflict: Room 204 is currently awaiting housekeeping inspection.`

---

### Scenario 4: "How do you handle audit logging for sensitive actions like room price adjustments or staff provisioning?"
**Approach**:
- Create an `AuditLog` collection:
  ```javascript
  const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g. 'PRICE_SURGE_APPLIED', 'STAFF_PROVISIONED'
    performed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    target_entity: { type: String, required: true }, // e.g. 'Room:64f1...'
    changes: { before: mongoose.Schema.Types.Mixed, after: mongoose.Schema.Types.Mixed },
    ip_address: String,
    timestamp: { type: Date, default: Date.now }
  });
  ```
- Attach an Express interceptor on administrative mutation routes (`POST`, `PATCH`, `DELETE`) to record these logs automatically for compliance and dispute resolution.

---

## 7. Behavioral & Engineering Trade-Off Questions (STAR Method)

### Q15: "What was the most challenging technical hurdle you faced while building this project and how did you resolve it?"
**Answer**:
- **Situation**: Designing a unified RBAC system where four distinct user roles shared the same API backend, but required radically different dashboard interfaces without code duplication or state leaks.
- **Task**: Avoid creating 4 separate web apps while ensuring strict security boundaries and tailored UX for Front Desk vs. Strategic Managers.
- **Action**:
  - Engineered a modular role hierarchy in Express middleware (`authorizeRoles`) and paired it with a single, highly performant React dashboard page (`AdminDashboardPage.tsx`) using conditional component slices.
  - Implemented Property Scoping so managers and staff are strictly restricted to their assigned property (`hotel_id`), while super admins retain multi-property governance.
- **Result**: Reduced codebase maintenance overhead by 60%, eliminated authorization vulnerabilities, and delivered a seamless sub-100ms switching experience for interview demonstrations.

---

### Q16: "If you had 2 more weeks to work on this platform, what architectural improvements or features would you build next?"
**Answer**:
1. **Automated End-to-End Testing**: Integrate Playwright or Cypress test suites for the entire guest booking flow (Search $\rightarrow$ Select Suite $\rightarrow$ Apply Coupon $\rightarrow$ Checkout $\rightarrow$ Front Desk Check-in).
2. **Real-Time WebSockets**: Replace manual sync buttons with Socket.io for live instant updates on room availability, new reservations, and housekeeping statuses.
3. **Automated PDF Invoice Generation**: Add serverless PDF rendering (Puppeteer or PDFKit) to generate branded GST invoices upon guest check-out with downloadable PDF links.
