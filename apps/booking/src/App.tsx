import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Core Pages
import { LandingPage } from './pages/LandingPage';
import { HotelListingPage } from './pages/HotelListingPage';
import { HotelDetailsPage } from './pages/HotelDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { MyBookingsPage } from './pages/MyBookingsPage';

// Admin Page
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Auth Pages & Route Guard
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { UpdatePasswordPage } from './pages/UpdatePasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Components
import { Navbar } from './components/layout/Navbar';

const queryClient = new QueryClient();

// Main Layout Wrapper
const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    <main className="flex-1">
      {children}
    </main>
    <footer className="bg-slate-900 text-slate-300 py-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white text-lg font-bold mb-4">Grand Palace</h3>
          <p className="text-sm">Experience luxury like never before. Book your stay at the world's finest hotels.</p>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">About Us</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
            <li><a href="#" className="hover:text-white">Press</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Help Center</a></li>
            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Newsletter</h4>
          <p className="text-sm mb-4">Subscribe to get special offers.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Email" className="px-3 py-2 bg-slate-800 rounded text-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-accent" />
            <button className="bg-accent text-white px-4 py-2 rounded text-sm hover:bg-accent/90">Join</button>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 mt-8 pt-8 text-center text-xs">
        &copy; {new Date().getFullYear()} Grand Palace Hotels. All rights reserved.
      </div>
    </footer>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
