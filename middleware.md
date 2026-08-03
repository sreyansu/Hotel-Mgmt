# Authentication & Authorization Middleware Manual (`middleware.md`)

## 1. Middleware Architecture Overview

Security in PARADISE Palace Hotels is handled through modular Express middleware pipelines located in `server/middleware/auth.js`.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend React Client
    participant MW1 as authenticate Middleware
    participant MW2 as authorizeRoles Middleware
    participant Controller as Route Controller
    participant DB as MongoDB Database

    Client->>MW1: HTTP Request + Bearer JWT Header
    Note over MW1: Checks header format<br/>Extracts Bearer token
    alt Token Missing
        MW1-->>Client: 401 Unauthorized ("Access token missing")
    else Token Present
        MW1->>MW1: jwt.verify(token, JWT_SECRET)
        alt Token Expired / Invalid
            MW1-->>Client: 401 Unauthorized ("Invalid or expired token")
        else Token Valid
            MW1->>DB: User.findById(decoded.id)
            alt User Not Found in DB
                MW1-->>Client: 401 Unauthorized ("User not found")
            else User Found
                MW1->>MW2: req.user = userObj; next()
                Note over MW2: Evaluates req.user.role against allowed roles
                alt Role Not Allowed
                    MW2-->>Client: 403 Forbidden ("Access forbidden: insufficient role permissions")
                else Role Allowed
                    MW2->>Controller: next()
                    Controller->>Client: 200/201 JSON Response
                end
            end
        end
    end
```

---

## 2. Core Middleware Implementations

### 2.1 `authenticate` Middleware
```javascript
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Please provide a valid Bearer token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hotel_mgmt_jwt_secret_key_2026');

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User session expired or user no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token', error: error.message });
  }
};
```

### 2.2 `authorizeRoles` Higher-Order Middleware Factory
```javascript
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Your role: ${req.user?.role || 'Guest'}`,
      });
    }
    next();
  };
};
```

---

## 3. Real-World Route Guard Examples

### 1. Public Route (No middleware)
```javascript
// Any anonymous visitor can browse hotels
router.get('/', hotelController.getAllHotels);
```

### 2. Authenticated Customer Route (`authenticate` only)
```javascript
// Any logged-in customer or admin can fetch their own profile
router.get('/me', authenticate, authController.getMe);
router.get('/my-bookings', authenticate, bookingController.getMyBookings);
```

### 3. Role-Restricted Admin Route (`authenticate` + `authorizeRoles`)
```javascript
// Only Super Admin and Hotel Managers can add hotels or rooms
router.post('/', authenticate, authorizeRoles('super_admin', 'hotel_manager'), hotelController.createHotel);

// Only Super Admins can provision staff accounts or manage discount coupons
router.post('/admin/create-user', authenticate, authorizeRoles('super_admin'), authController.createUser);
router.post('/admin', authenticate, authorizeRoles('super_admin'), couponController.createCoupon);
```

---

## 4. Client-Side Axios Integration (`apps/booking/src/lib/api.ts`)

The client automatically attaches the stored JWT token to all outgoing requests via Axios interceptors:

```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```
If the server returns a `401 Unauthorized`, the client intercepts the error and routes the user to the unified `/login` page with session recovery.
