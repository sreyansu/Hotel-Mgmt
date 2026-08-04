/**
 * ==============================================================================
 * PARADISE PALACE HOTELS - MAIN REACT APP COMPONENT
 * ==============================================================================
 * Routing & Provider Hierarchy:
 * - QueryClientProvider (@tanstack/react-query)
 * - AuthProvider (Global RBAC and JWT session context)
 * - BrowserRouter (Client-side routing)
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';

// Core Pages
import { LandingPage } from './pages/LandingPage';
import { HotelListingPage } from './pages/HotelListingPage';
import { HotelDetailsPage } from './pages/HotelDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { MyBookingsPage } from './pages/MyBookingsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

// Auth Pages & Route Guard
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { UpdatePasswordPage } from './pages/UpdatePasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Components
import { Navbar } from './components/layout/Navbar';
import paradiseLogo from './paradise_logo.png';

const queryClient = new QueryClient();

// Main Layout Wrapper
const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    <main className="flex-1">
      {children}
    </main>
    <footer className="bg-slate-950 text-slate-300 py-12 border-t border-slate-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={paradiseLogo} alt="PARADISE Palace Hotels" className="h-10 w-auto rounded-lg bg-white/10 p-1" />
            <div>
              <h3 className="text-white text-lg font-bold leading-tight">PARADISE</h3>
              <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Palace Hotels</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">Experience world-class luxury and timeless elegance across our flagship properties in India.</p>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Properties</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="/hotels" className="hover:text-amber-400 transition-colors">Delhi Imperial</a></li>
            <li><a href="/hotels" className="hover:text-amber-400 transition-colors">Goa Seaview Resort</a></li>
            <li><a href="/hotels" className="hover:text-amber-400 transition-colors">Jaipur Heritage Palace</a></li>
            <li><a href="/hotels" className="hover:text-amber-400 transition-colors">Mumbai Marina Bay</a></li>
            <li><a href="/hotels" className="hover:text-amber-400 transition-colors">Udaipur Lake Palace</a></li>
            <li><a href="/hotels" className="hover:text-amber-400 transition-colors">Manali Alpine Retreat</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Guest Support</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#" className="hover:text-amber-400 transition-colors">Concierge & Help Desk</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Terms of Hospitality</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Booking Modifications</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Royal Newsletter</h4>
          <p className="text-sm text-slate-400 mb-4">Subscribe for seasonal discounts & privileged offers.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Enter your email" className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm w-full focus:outline-none focus:border-amber-500" />
            <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Join</button>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-900 mt-10 pt-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} PARADISE Palace Hotels & Resorts Ltd. All rights reserved.
      </div>
    </footer>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/hotels" element={<HotelListingPage />} />
              <Route path="/hotels/:slug" element={<HotelDetailsPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/bookings" element={<MyBookingsPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/update-password" element={<UpdatePasswordPage />} />
              
              {/* Authenticated Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* RBAC Protected Admin Dashboard Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'hotel_manager', 'staff']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MainLayout>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
