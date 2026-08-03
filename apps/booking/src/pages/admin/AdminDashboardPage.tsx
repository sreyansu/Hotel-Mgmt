/**
 * ==============================================================================
 * ROLE-SPECIALIZED HOSPITALITY MANAGEMENT DASHBOARD (`/admin`)
 * ==============================================================================
 * Tailored interfaces for 3 distinct RBAC personas:
 * 1. Front Desk Staff: Live Guest Check-in Desk, Interactive Room Status Grid (101-304), Room Key Assignment, Guest Concierge Request Logger.
 * 2. Hotel Operations Manager: Property Performance KPIs (Occupancy %, ADR, Revenue), Dynamic Surge / Discount Room Pricing Manager, Inventory Unit Controls.
 * 3. Super Admin: Multi-property portfolio management, global bookings master ledger, promo discount campaigns, and RBAC team provisioning.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  CalendarCheck, 
  CreditCard, 
  Ticket, 
  BedDouble, 
  Plus, 
  TrendingUp,
  RefreshCw,
  UserCheck,
  UserPlus,
  Trash2,
  MapPin,
  Settings,
  Star,
  X,
  Search,
  CheckCircle2,
  Clock,
  LogOut as LogOutIcon,
  Users,
  Key,
  DollarSign,
  Check,
  Edit2,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserAvatar } from '../../components/ui/AvatarPicker';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'staff';
  const isSuperAdmin = role === 'super_admin';
  const isManager = role === 'hotel_manager';
  const isStaffOnly = role === 'staff';

  // Active Tab state based on Role
  const [activeTab, setActiveTab] = useState<string>(
    isStaffOnly ? 'front_desk' : isManager ? 'pricing_inventory' : 'overview'
  );

  const [bookings, setBookings] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [teamUsers, setTeamUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state for Front Desk / Manager
  const [guestSearch, setGuestSearch] = useState('');
  const [selectedHotelFilter] = useState<string>('all');
  const [frontDeskStatusFilter, setFrontDeskStatusFilter] = useState<'all' | 'arrivals' | 'in_house' | 'departures'>('all');

  // Room Assignment & Notes Modal State (Front Desk)
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [assignRoomNumber, setAssignRoomNumber] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);

  // Room Pricing Quick Edit State (Hotel Manager)
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<number>(0);
  const [editUnitsValue, setEditUnitsValue] = useState<number>(5);
  const [savingRoomPrice, setSavingRoomPrice] = useState(false);

  // Room Housekeeping Status Grid (Front Desk local state)
  const [roomCleanStates, setRoomCleanStates] = useState<Record<string, 'clean' | 'dirty' | 'cleaning'>>({
    '101': 'clean',
    '102': 'clean',
    '103': 'dirty',
    '201': 'clean',
    '202': 'clean',
    '203': 'dirty',
    '301': 'clean',
    '302': 'clean',
    '303': 'cleaning',
    '401': 'clean',
    '402': 'clean',
  });

  // New Coupon Form State (Super Admin)
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('15');
  const [newCouponExpiry, setNewCouponExpiry] = useState('');
  const [couponSubmitting, setCouponSubmitting] = useState(false);

  // Add Hotel Modal State (Super Admin)
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [hotelForm, setHotelForm] = useState({
    name: '',
    slug: '',
    address: '',
    description: '',
    rating: '4.8',
    images: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000',
    amenities: 'Pool, Spa, Gym, WiFi, Fine Dining',
    contact_email: '',
    contact_phone: '',
  });
  const [hotelSubmitting, setHotelSubmitting] = useState(false);

  // Add Room Modal State (Super Admin & Manager)
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({
    hotel_id: '',
    name: '',
    description: '',
    price_per_night: '6500',
    capacity: '2',
    total_units: '5',
    amenities: 'King Bed, Balcony, WiFi, AC, Breakfast',
    images: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32',
  });
  const [roomSubmitting, setRoomSubmitting] = useState(false);

  // Add Team Member Modal State (Super Admin)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'hotel_manager',
    hotel_id: '',
    phone: '',
  });
  const [userSubmitting, setUserSubmitting] = useState(false);

  // Fetch all dashboard data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, hotelsRes, roomsRes, couponsRes, usersRes] = await Promise.all([
        api.get('/bookings/admin/all').catch(() => ({ bookings: [] })),
        api.get('/hotels').catch(() => ({ hotels: [] })),
        api.get('/hotels/admin/rooms').catch(() => ({ rooms: [] })),
        api.get('/coupons/admin/all').catch(() => ({ coupons: [] })),
        isSuperAdmin ? api.get('/auth/admin/users').catch(() => ({ users: [] })) : Promise.resolve({ users: [] }),
      ]);
      setBookings(bookingsRes?.bookings || []);
      setHotels(hotelsRes?.hotels || []);
      setRooms(roomsRes?.rooms || []);
      setCoupons(couponsRes?.coupons || []);
      setTeamUsers(usersRes?.users || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  // Determine user's assigned hotel
  const assignedHotelId = (typeof user?.hotel_id === 'object' ? user?.hotel_id?._id || user?.hotel_id?.id : user?.hotel_id) || (hotels[0]?._id ?? '');
  const assignedHotel = hotels.find((h) => h._id === assignedHotelId || h.id === assignedHotelId) || hotels[0];

  // Update booking lifecycle status
  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await api.patch(`/bookings/admin/${bookingId}/status`, { status });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status');
    }
  };

  // Update room assignment & special concierge notes
  const handleSaveBookingDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    setSavingDetails(true);
    try {
      await api.patch(`/bookings/admin/${editingBooking._id}/details`, {
        room_number: assignRoomNumber,
        special_requests: specialNotes,
      });
      setEditingBooking(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update booking details');
    } finally {
      setSavingDetails(false);
    }
  };

  // Update room price / units dynamically (Hotel Manager)
  const handleSaveRoomPrice = async (roomId: string) => {
    setSavingRoomPrice(true);
    try {
      await api.patch(`/hotels/rooms/${roomId}`, {
        price_per_night: editPriceValue,
        total_units: editUnitsValue,
      });
      setEditingRoomId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update room price');
    } finally {
      setSavingRoomPrice(false);
    }
  };

  // Delete room suite
  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room suite?')) return;
    try {
      await api.delete(`/hotels/rooms/${roomId}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete room suite');
    }
  };

  // Create new coupon (Super Admin)
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDiscount) return;

    setCouponSubmitting(true);
    try {
      await api.post('/coupons/admin', {
        code: newCouponCode,
        discount_percentage: Number(newCouponDiscount),
        valid_until: newCouponExpiry || null,
      });
      setNewCouponCode('');
      setNewCouponExpiry('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    } finally {
      setCouponSubmitting(false);
    }
  };

  // Create new hotel (Super Admin)
  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setHotelSubmitting(true);
    try {
      const amenitiesArr = hotelForm.amenities.split(',').map((s) => s.trim()).filter(Boolean);
      const imagesArr = hotelForm.images.split(',').map((s) => s.trim()).filter(Boolean);

      await api.post('/hotels', {
        name: hotelForm.name,
        slug: hotelForm.slug || hotelForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        address: hotelForm.address,
        description: hotelForm.description,
        rating: Number(hotelForm.rating),
        amenities: amenitiesArr,
        images: imagesArr,
        contact_email: hotelForm.contact_email,
        contact_phone: hotelForm.contact_phone,
      });

      setShowAddHotelModal(false);
      setHotelForm({
        name: '',
        slug: '',
        address: '',
        description: '',
        rating: '4.8',
        images: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000',
        amenities: 'Pool, Spa, Gym, WiFi, Fine Dining',
        contact_email: '',
        contact_phone: '',
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create hotel property');
    } finally {
      setHotelSubmitting(false);
    }
  };

  // Create new room (Super Admin & Manager)
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetHotelId = roomForm.hotel_id || (isManager && assignedHotel ? assignedHotel.id || assignedHotel._id : '');
    if (!targetHotelId) {
      alert('Please select a hotel for this room suite');
      return;
    }

    setRoomSubmitting(true);
    try {
      const amenitiesArr = roomForm.amenities.split(',').map((s) => s.trim()).filter(Boolean);
      const imagesArr = roomForm.images.split(',').map((s) => s.trim()).filter(Boolean);

      await api.post('/hotels/rooms', {
        hotel_id: targetHotelId,
        name: roomForm.name,
        description: roomForm.description,
        price_per_night: Number(roomForm.price_per_night),
        capacity: Number(roomForm.capacity),
        total_units: Number(roomForm.total_units),
        amenities: amenitiesArr,
        images: imagesArr,
      });

      setShowAddRoomModal(false);
      setRoomForm({
        hotel_id: '',
        name: '',
        description: '',
        price_per_night: '6500',
        capacity: '2',
        total_units: '5',
        amenities: 'King Bed, Balcony, WiFi, AC, Breakfast',
        images: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32',
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create room');
    } finally {
      setRoomSubmitting(false);
    }
  };

  // Create team member with assigned hotel (Super Admin)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserSubmitting(true);
    try {
      await api.post('/auth/admin/create-user', userForm);
      setShowAddUserModal(false);
      setUserForm({
        email: '',
        password: '',
        full_name: '',
        role: 'hotel_manager',
        hotel_id: '',
        phone: '',
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create team member');
    } finally {
      setUserSubmitting(false);
    }
  };

  // Delete team member
  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to remove this user account?')) return;
    try {
      await api.delete(`/auth/admin/users/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  // Toggle Room Housekeeping Status
  const toggleRoomCleanStatus = (roomNum: string) => {
    setRoomCleanStates((prev) => {
      const current = prev[roomNum] || 'clean';
      const next = current === 'clean' ? 'dirty' : current === 'dirty' ? 'cleaning' : 'clean';
      return { ...prev, [roomNum]: next };
    });
  };

  // Filtering calculations
  const filteredBookings = bookings.filter((b) => {
    const matchesHotel =
      isStaffOnly || isManager
        ? (assignedHotel && (b.hotel?._id === assignedHotel.id || b.hotel?.id === assignedHotel.id || b.hotel?._id === assignedHotel._id))
        : selectedHotelFilter === 'all' || b.hotel?._id === selectedHotelFilter || b.hotel?.id === selectedHotelFilter;

    if (!matchesHotel) return false;

    if (guestSearch) {
      const q = guestSearch.toLowerCase();
      const nameMatch = b.guest_name?.toLowerCase().includes(q);
      const emailMatch = b.guest_email?.toLowerCase().includes(q);
      const phoneMatch = b.guest_phone?.includes(q);
      const roomMatch = b.room?.name?.toLowerCase().includes(q) || b.room_number?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !phoneMatch && !roomMatch) return false;
    }

    if (isStaffOnly && frontDeskStatusFilter !== 'all') {
      if (frontDeskStatusFilter === 'arrivals') return b.status === 'confirmed';
      if (frontDeskStatusFilter === 'in_house') return b.status === 'checked_in';
      if (frontDeskStatusFilter === 'departures') return b.status === 'checked_out' || b.status === 'checked_in';
    }

    return true;
  });

  // KPI Calculations
  const totalRevenue = bookings.reduce((sum, b) => (b.payment_status === 'paid' || b.status !== 'cancelled' ? sum + (b.total_price || 0) : sum), 0);
  const propertyBookings = bookings.filter((b) => assignedHotel && (b.hotel?._id === assignedHotel._id || b.hotel?.id === assignedHotel._id || b.hotel?._id === assignedHotel.id));
  const propertyRevenue = propertyBookings.reduce((sum, b) => (b.payment_status === 'paid' || b.status !== 'cancelled' ? sum + (b.total_price || 0) : sum), 0);

  const arrivalsToday = propertyBookings.filter((b) => b.status === 'confirmed');
  const inHouseGuests = propertyBookings.filter((b) => b.status === 'checked_in');
  const departuresToday = propertyBookings.filter((b) => b.status === 'checked_out');

  // Manager KPI Metrics: Occupancy Rate and ADR (Average Daily Rate)
  const propertyRooms = rooms.filter((r) => !assignedHotel || r.hotel?._id === assignedHotel._id || r.hotel?.id === assignedHotel.id);
  const totalPropertyUnits = propertyRooms.reduce((sum, r) => sum + (r.total_units || 5), 0) || 25;
  const occupiedUnits = inHouseGuests.length;
  const occupancyPercentage = Math.min(100, Math.round((occupiedUnits / totalPropertyUnits) * 100)) || (inHouseGuests.length > 0 ? 65 : 40);
  const averageDailyRate = inHouseGuests.length > 0 
    ? Math.round(inHouseGuests.reduce((sum, b) => sum + (b.total_price || 0), 0) / inHouseGuests.length)
    : (propertyRooms[0]?.price_per_night || 8500);

  // Virtual Room Grid definition (101 to 304)
  const physicalRooms = useMemo(() => {
    const roomList = [
      { number: '101', floor: 1, type: 'Deluxe Heritage Room' },
      { number: '102', floor: 1, type: 'Deluxe Heritage Room' },
      { number: '103', floor: 1, type: 'Deluxe Heritage Room' },
      { number: '104', floor: 1, type: 'Deluxe Garden View' },
      { number: '201', floor: 2, type: 'Executive Palace Suite' },
      { number: '202', floor: 2, type: 'Executive Palace Suite' },
      { number: '203', floor: 2, type: 'Royal Lakeview Suite' },
      { number: '204', floor: 2, type: 'Royal Lakeview Suite' },
      { number: '301', floor: 3, type: 'Presidential Maharaja Suite' },
      { number: '302', floor: 3, type: 'Presidential Maharaja Suite' },
      { number: '303', floor: 3, type: 'Imperial Penthouse' },
      { number: '304', floor: 3, type: 'Imperial Penthouse' },
    ];

    return roomList.map((rm) => {
      // Find if an in-house or confirmed guest is assigned to this room
      const activeBooking = propertyBookings.find((b) => b.room_number === rm.number && b.status === 'checked_in') ||
                            propertyBookings.find((b) => b.room_number === rm.number && b.status === 'confirmed');
      const cleanStatus = roomCleanStates[rm.number] || (activeBooking ? 'clean' : 'clean');
      return {
        ...rm,
        booking: activeBooking,
        isOccupied: activeBooking?.status === 'checked_in',
        isReserved: activeBooking?.status === 'confirmed',
        cleanStatus,
      };
    });
  }, [propertyBookings, roomCleanStates]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ========================================================================= */}
      {/* HEADER TOOLBAR WITH ROLE BADGE & ACTIONS */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">

            {(isManager || isStaffOnly) && assignedHotel && (
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                <MapPin className="w-3 h-3 text-slate-400" />
                {assignedHotel.name}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isSuperAdmin && 'Enterprise Hospitality Command Center'}
            {isManager && `${assignedHotel?.name || 'Property'} Management Portal`}
            {isStaffOnly && 'Front Desk Operations & Guest Terminal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isSuperAdmin && 'Complete platform oversight: properties catalog, dynamic rates, coupon campaigns, and RBAC team.'}
            {isManager && 'Property financial performance, occupancy rates, dynamic price surges, and room inventory suites.'}
            {isStaffOnly && 'Real-time guest arrivals, room key assignments, housekeeping status grid, and express check-in.'}
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 h-10 border-slate-200 bg-white shadow-xs text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </Button>

          <Link to="/profile">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 h-10 border-slate-200 bg-white shadow-xs hover:border-primary/50 text-xs font-semibold"
            >
              <UserAvatar avatarId={user?.avatar_url} size="sm" />
              <span className="hidden sm:inline">{user?.full_name || 'My Profile'}</span>
              <Settings className="w-3.5 h-3.5 text-slate-400" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DYNAMIC ROLE-BASED TABS NAVIGATION */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
        {/* 🛎️ Front Desk Staff Tabs */}
        {isStaffOnly && (
          <>
            <button
              onClick={() => setActiveTab('front_desk')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === 'front_desk' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Guest Check-In Desk ({propertyBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('room_grid')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === 'room_grid' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Key className="w-4 h-4" />
              Live Room Grid & Keys ({physicalRooms.length} Rooms)
            </button>
            <button
              onClick={() => setActiveTab('in_house')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === 'in_house' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              In-House Guests ({inHouseGuests.length})
            </button>
          </>
        )}

        {/* 📊 Hotel Operations Manager Tabs */}
        {isManager && (
          <>
            <button
              onClick={() => setActiveTab('pricing_inventory')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === 'pricing_inventory' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Dynamic Room Pricing & Inventory
            </button>
            <button
              onClick={() => setActiveTab('property_reservations')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === 'property_reservations' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              Guest Ledger ({propertyBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('property_profile')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === 'property_profile' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Property Profile & Amenities
            </button>
          </>
        )}

        {/* 👑 Super Admin Tabs */}
        {isSuperAdmin && (
          <>
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Executive Analytics
            </button>
            <button
              onClick={() => setActiveTab('hotels')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === 'hotels' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Hotels Portfolio ({hotels.length})
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === 'coupons' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Ticket className="w-4 h-4" />
              Promotions & Coupons ({coupons.length})
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === 'team' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              RBAC Team Provisioning ({teamUsers.length})
            </button>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🛎️ SECTION 1: FRONT DESK & CONCIERGE SPECIALIZED DASHBOARD */}
      {/* ========================================================================= */}
      {isStaffOnly && (
        <div className="space-y-8">
          {/* Quick Front Desk Live Operations Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Arrivals</p>
                <p className="text-2xl font-black text-slate-900">{arrivalsToday.length} Guests</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Currently In-House</p>
                <p className="text-2xl font-black text-slate-900">{inHouseGuests.length} Guests</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <LogOutIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Departures Today</p>
                <p className="text-2xl font-black text-slate-900">{departuresToday.length} Guests</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Clean Rooms Ready</p>
                <p className="text-2xl font-black text-slate-900">
                  {physicalRooms.filter((r) => r.cleanStatus === 'clean' && !r.isOccupied).length} / {physicalRooms.length}
                </p>
              </div>
            </div>
          </div>

          {/* TAB 1: GUEST CHECK-IN DESK & QUEUE */}
          {(activeTab === 'front_desk' || activeTab === 'in_house') && (
            <div className="space-y-6">
              {/* Search and Operational Filter Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    placeholder="Fast Lookup: guest name, phone, email, or room number..."
                    className="pl-10 text-sm h-10 w-full"
                  />
                  {guestSearch && (
                    <button onClick={() => setGuestSearch('')} className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2">
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  <button
                    onClick={() => setFrontDeskStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      frontDeskStatusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({propertyBookings.length})
                  </button>
                  <button
                    onClick={() => setFrontDeskStatusFilter('arrivals')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      frontDeskStatusFilter === 'arrivals' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    Arrivals ({arrivalsToday.length})
                  </button>
                  <button
                    onClick={() => setFrontDeskStatusFilter('in_house')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      frontDeskStatusFilter === 'in_house' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    In-House ({inHouseGuests.length})
                  </button>
                  <button
                    onClick={() => setFrontDeskStatusFilter('departures')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      frontDeskStatusFilter === 'departures' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                    }`}
                  >
                    Departures ({departuresToday.length})
                  </button>
                </div>
              </div>

              {/* Guest Roster Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {frontDeskStatusFilter === 'in_house' ? 'Currently In-House Guests' : 'Front Desk Operational Guest Queue'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      1-click check-ins, room key assignments, and concierge notes logger.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3.5">Guest & Contact</th>
                        <th className="px-5 py-3.5">Room & Key</th>
                        <th className="px-5 py-3.5">Stay Dates</th>
                        <th className="px-5 py-3.5">Special Requests</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Front Desk Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                            No reservations found for the selected filter.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-4">
                              <p className="font-bold text-slate-900 text-sm">{b.guest_name}</p>
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400" /> {b.guest_email}
                              </p>
                              {b.guest_phone && (
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" /> {b.guest_phone}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-800 text-xs">{b.room?.name || 'Deluxe Suite'}</p>
                              <div className="mt-1 flex items-center gap-1.5">
                                {b.room_number ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                    <Key className="w-3 h-3" /> Room {b.room_number}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-amber-600 font-semibold italic">Unassigned Room</span>
                                )}
                                <button
                                  onClick={() => {
                                    setEditingBooking(b);
                                    setAssignRoomNumber(b.room_number || '');
                                    setSpecialNotes(b.special_requests || '');
                                  }}
                                  className="text-xs text-slate-400 hover:text-primary p-0.5"
                                  title="Assign Room Number & Notes"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-xs font-semibold text-slate-800">{b.check_in_date} → {b.check_out_date}</p>
                              <span className="text-[11px] font-bold text-emerald-600">₹{b.total_price?.toLocaleString('en-IN')} (Paid)</span>
                            </td>

                            <td className="px-5 py-4 max-w-[200px]">
                              {b.special_requests ? (
                                <p className="text-xs text-slate-600 bg-amber-50/60 p-1.5 rounded-lg border border-amber-100 line-clamp-2">
                                  "{b.special_requests}"
                                </p>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingBooking(b);
                                    setAssignRoomNumber(b.room_number || '');
                                    setSpecialNotes('');
                                  }}
                                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 italic"
                                >
                                  <Plus className="w-3 h-3" /> Add note
                                </button>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                                b.status === 'confirmed' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                                b.status === 'checked_in' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                                b.status === 'checked_out' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                                'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}>
                                {b.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {b.status === 'confirmed' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateStatus(b._id, 'checked_in')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 shadow-xs"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Check In
                                  </Button>
                                )}
                                {b.status === 'checked_in' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateStatus(b._id, 'checked_out')}
                                    className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs h-8"
                                  >
                                    <LogOutIcon className="w-3.5 h-3.5 mr-1" /> Check Out
                                  </Button>
                                )}
                                <select
                                  value={b.status}
                                  onChange={(e) => handleUpdateStatus(b._id, e.target.value)}
                                  className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none h-8 font-medium text-slate-700"
                                >
                                  <option value="confirmed">Confirmed</option>
                                  <option value="checked_in">Checked In</option>
                                  <option value="checked_out">Checked Out</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE INTERACTIVE ROOM STATUS GRID (101 - 304) */}
          {activeTab === 'room_grid' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    Property Room Board & Key Assignment
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live room occupancy and housekeeping turnover board for {assignedHotel?.name}.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Available & Clean
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span> Occupied (In-House)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span> Cleaning / Dirty
                  </span>
                </div>
              </div>

              {/* Physical Rooms Visual Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {physicalRooms.map((room) => {
                  const isClean = room.cleanStatus === 'clean';
                  const isDirty = room.cleanStatus === 'dirty';
                  const isCleaning = room.cleanStatus === 'cleaning';

                  return (
                    <div
                      key={room.number}
                      className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative ${
                        room.isOccupied
                          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                          : room.isReserved
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                          : isDirty
                          ? 'bg-amber-50/40 border-amber-200/80'
                          : isCleaning
                          ? 'bg-sky-50/50 border-sky-200'
                          : 'bg-white border-slate-200/80 hover:border-primary/50 shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-extrabold tracking-tight">Room {room.number}</span>
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            room.isOccupied ? 'bg-red-500 ring-4 ring-red-100' :
                            room.isReserved ? 'bg-amber-500 ring-4 ring-amber-100' :
                            isCleaning ? 'bg-sky-500 ring-4 ring-sky-100' :
                            isDirty ? 'bg-amber-400 ring-4 ring-amber-100' :
                            'bg-emerald-500 ring-4 ring-emerald-100'
                          }`} />
                        </div>

                        <p className="text-[11px] font-semibold text-slate-500 truncate mb-2">{room.type}</p>

                        {room.booking ? (
                          <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs">
                            <p className="font-bold truncate text-slate-900">{room.booking.guest_name}</p>
                            <p className="text-[10px] text-slate-500">Out: {room.booking.check_out_date}</p>
                          </div>
                        ) : (
                          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-400 font-medium">
                            <span>Vacant</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-2 flex items-center justify-between gap-1 border-t border-slate-100">
                        <button
                          onClick={() => toggleRoomCleanStatus(room.number)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${
                            isClean ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            isDirty ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            'bg-sky-100 text-sky-800 border-sky-300'
                          }`}
                          title="Click to toggle Housekeeping Status"
                        >
                          {isClean ? 'Clean' : isDirty ? 'Dirty' : 'Cleaning'}
                        </button>

                        {room.booking && room.booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(room.booking._id, 'checked_in')}
                            className="text-[10px] font-bold text-primary hover:underline"
                          >
                            Check In →
                          </button>
                        )}
                        {room.booking && room.booking.status === 'checked_in' && (
                          <button
                            onClick={() => handleUpdateStatus(room.booking._id, 'checked_out')}
                            className="text-[10px] font-bold text-blue-600 hover:underline"
                          >
                            Check Out →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📊 SECTION 2: HOTEL OPERATIONS MANAGER SPECIALIZED DASHBOARD */}
      {/* ========================================================================= */}
      {isManager && (
        <div className="space-y-8">
          {/* Executive Performance KPIs (Occupancy %, Revenue, ADR, Suites) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Property Occupancy</span>
                <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {occupiedUnits} / {totalPropertyUnits} Units
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">{occupancyPercentage}%</p>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${occupancyPercentage}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Property Revenue</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">₹{propertyRevenue.toLocaleString('en-IN')}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Live settled bookings</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Daily Rate (ADR)</span>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-black text-slate-900">₹{averageDailyRate.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Avg earnings per occupied room</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Property Guest Rating</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-amber-600">{assignedHotel?.rating || 4.9} / 5.0</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Based on guest verified stays</p>
            </div>
          </div>

          {/* TAB 1: DYNAMIC ROOM PRICING & INVENTORY CONTROL */}
          {activeTab === 'pricing_inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-5 rounded-2xl border border-blue-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Dynamic Room Suite Pricing & Inventory Controller
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Adjust nightly rates, surge pricing for high-demand seasons, and inventory capacity directly.
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setRoomForm((prev) => ({ ...prev, hotel_id: assignedHotel?.id || assignedHotel?._id }));
                    setShowAddRoomModal(true);
                  }}
                  className="text-xs h-9 font-semibold"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Add New Suite Category
                </Button>
              </div>

              {/* Room Suite Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertyRooms.map((room) => {
                  const isEditing = editingRoomId === (room.id || room._id);

                  return (
                    <div key={room.id || room._id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="h-44 overflow-hidden relative bg-slate-100">
                          <img
                            src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427'}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-slate-900 shadow-sm border border-slate-200">
                            ₹{room.price_per_night?.toLocaleString('en-IN')} / night
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-slate-900 text-base">{room.name}</h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{room.description}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteRoom(room.id || room._id)}
                              className="text-slate-400 hover:text-red-600 p-1"
                              title="Delete Room Suite"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Dynamic Pricing Controller Box */}
                          <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                            {isEditing ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Rate Per Night (₹)
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      value={editPriceValue}
                                      onChange={(e) => setEditPriceValue(Number(e.target.value))}
                                      className="h-8 text-xs font-bold"
                                    />
                                    {/* Quick Surge Buttons */}
                                    <button
                                      type="button"
                                      onClick={() => setEditPriceValue((prev) => prev + 500)}
                                      className="px-2 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded hover:bg-slate-100"
                                    >
                                      +500
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditPriceValue((prev) => Math.max(1000, prev - 500))}
                                      className="px-2 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded hover:bg-slate-100"
                                    >
                                      -500
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Total Physical Units
                                  </label>
                                  <Input
                                    type="number"
                                    value={editUnitsValue}
                                    onChange={(e) => setEditUnitsValue(Number(e.target.value))}
                                    className="h-8 text-xs font-bold"
                                  />
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    disabled={savingRoomPrice}
                                    onClick={() => handleSaveRoomPrice(room.id || room._id)}
                                    className="h-7 text-xs font-bold flex-1"
                                  >
                                    <Check className="w-3.5 h-3.5 mr-1" /> Save Dynamic Rate
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingRoomId(null)}
                                    className="h-7 text-xs"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-[11px] font-semibold text-slate-500 block">Current Nightly Rate</span>
                                  <span className="text-base font-extrabold text-slate-900">
                                    ₹{room.price_per_night?.toLocaleString('en-IN')}
                                  </span>
                                  <span className="text-xs text-slate-400 block mt-0.5">
                                    Inventory: <strong>{room.total_units || 5} units</strong> (Cap: {room.capacity} guests)
                                  </span>
                                </div>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingRoomId(room.id || room._id);
                                    setEditPriceValue(room.price_per_night || 6500);
                                    setEditUnitsValue(room.total_units || 5);
                                  }}
                                  className="h-8 text-xs font-bold border-slate-300"
                                >
                                  <Edit2 className="w-3 h-3 mr-1" /> Edit Rate
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PROPERTY GUEST LEDGER */}
          {activeTab === 'property_reservations' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Property Guest Ledger & Stays</h3>
                    <p className="text-xs text-slate-500">Historical and active reservations for {assignedHotel?.name}.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3.5">Guest Info</th>
                        <th className="px-5 py-3.5">Suite Category</th>
                        <th className="px-5 py-3.5">Dates & Nights</th>
                        <th className="px-5 py-3.5">Settlement (₹)</th>
                        <th className="px-5 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {propertyBookings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                            No reservations on record for this property.
                          </td>
                        </tr>
                      ) : (
                        propertyBookings.map((b) => (
                          <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-4">
                              <p className="font-bold text-slate-900">{b.guest_name}</p>
                              <p className="text-xs text-slate-500">{b.guest_email}</p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-800 text-xs">{b.room?.name || 'Deluxe Suite'}</p>
                              {b.room_number && (
                                <span className="text-[11px] text-purple-700 font-bold">Room {b.room_number}</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-xs font-medium text-slate-700">
                              {b.check_in_date} → {b.check_out_date}
                            </td>
                            <td className="px-5 py-4 font-bold text-slate-900 text-xs">
                              ₹{b.total_price?.toLocaleString('en-IN')}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                                b.status === 'confirmed' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                                b.status === 'checked_in' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                                b.status === 'checked_out' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                                'bg-slate-100 text-slate-800'
                              }`}>
                                {b.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROPERTY PROFILE */}
          {activeTab === 'property_profile' && assignedHotel && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-start gap-6">
                <img
                  src={assignedHotel.images?.[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'}
                  alt={assignedHotel.name}
                  className="w-48 h-36 rounded-xl object-cover shadow-sm"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900">{assignedHotel.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {assignedHotel.address}
                  </p>
                  <p className="text-sm text-slate-600 mt-3">{assignedHotel.description}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Contact Email</span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{assignedHotel.contact_email || 'concierge@paradisepalace.com'}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Contact Phone</span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{assignedHotel.contact_phone || '+91-11-2222-3333'}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Rating Score</span>
                  <p className="text-sm font-semibold text-amber-600 mt-0.5">{assignedHotel.rating || 4.9} / 5.0 (Verified)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 👑 SECTION 3: SUPER ADMIN SPECIALIZED VIEWS */}
      {/* ========================================================================= */}
      {isSuperAdmin && activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Global KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Revenue</span>
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">Live booking settlements</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Reservations</span>
                <CalendarCheck className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{bookings.length}</p>
              <p className="text-xs text-blue-600 font-medium mt-1">Across all properties</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Active Hotels</span>
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{hotels.length}</p>
              <p className="text-xs text-amber-600 font-medium mt-1">Locations across India</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Active Promo Codes</span>
                <Ticket className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{coupons.filter((c) => c.is_active).length}</p>
              <p className="text-xs text-purple-600 font-medium mt-1">Checkout discounts active</p>
            </div>
          </div>

          {/* Super Admin Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div
              onClick={() => setShowAddHotelModal(true)}
              className="p-6 bg-gradient-to-br from-amber-900 to-amber-800 text-white rounded-2xl shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <Building2 className="w-8 h-8 text-amber-300 mb-3" />
              <h3 className="text-lg font-bold">Add New Luxury Property</h3>
              <p className="text-xs text-amber-100 mt-1">Expand catalog with new hotel destinations across India.</p>
            </div>

            <div
              onClick={() => setShowAddRoomModal(true)}
              className="p-6 bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded-2xl shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <BedDouble className="w-8 h-8 text-blue-300 mb-3" />
              <h3 className="text-lg font-bold">Add Room Suite Category</h3>
              <p className="text-xs text-blue-100 mt-1">Provision presidential suites, chalets, and deluxe rooms.</p>
            </div>

            <div
              onClick={() => setShowAddUserModal(true)}
              className="p-6 bg-gradient-to-br from-emerald-900 to-emerald-800 text-white rounded-2xl shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <UserPlus className="w-8 h-8 text-emerald-300 mb-3" />
              <h3 className="text-lg font-bold">Provision Team & Staff</h3>
              <p className="text-xs text-emerald-100 mt-1">Create Hotel Managers and Front Desk Staff accounts.</p>
            </div>
          </div>
        </div>
      )}

      {/* SUPER ADMIN: HOTELS PORTFOLIO TAB */}
      {isSuperAdmin && activeTab === 'hotels' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900">PARADISE Palace Hotel Properties</h3>
              <p className="text-xs text-slate-500">Manage all signature hospitality properties, addresses, ratings, and room inventories.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowAddHotelModal(true)}>
                <Plus className="w-4 h-4 mr-1.5" /> Add New Hotel
              </Button>
              <Button variant="outline" onClick={() => setShowAddRoomModal(true)}>
                <BedDouble className="w-4 h-4 mr-1.5" /> Add Room Suite
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div key={hotel.id || hotel._id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded text-xs font-bold text-amber-700 shadow-xs flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {hotel.rating || 4.9}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{hotel.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {hotel.address}
                    </p>
                    <p className="text-xs text-slate-600 mt-3 line-clamp-2">{hotel.description}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">
                      {hotel.starting_price ? `Starting from ₹${hotel.starting_price.toLocaleString('en-IN')}` : 'Active Portfolio'}
                    </span>
                    <Link to={`/hotels/${hotel.slug}`} className="text-xs font-semibold text-accent hover:underline">
                      View Public Page →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUPER ADMIN: PROMOTIONAL COUPONS TAB */}
      {isSuperAdmin && activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Promotional Discount Coupon</h3>
            <p className="text-xs text-slate-500 mb-4">Issue active promo discount codes for customer checkout validation.</p>

            <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Code</label>
                <Input
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FESTIVE30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Percentage (%)</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(e.target.value)}
                  placeholder="15"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date (Optional)</label>
                <Input
                  type="date"
                  value={newCouponExpiry}
                  onChange={(e) => setNewCouponExpiry(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={couponSubmitting} className="h-10">
                {couponSubmitting ? 'Creating...' : 'Issue Coupon'}
              </Button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Active Discount Promo Codes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Promo Code</th>
                    <th className="px-6 py-4">Discount %</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Valid Until</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id || coupon._id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4 font-bold text-primary tracking-wider">{coupon.code}</td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">{coupon.discount_percent || coupon.discount_percentage}% OFF</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          coupon.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {coupon.is_active ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'No Expiry'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUPER ADMIN: TEAM PROVISIONING TAB */}
      {isSuperAdmin && activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Hospitality Staff & Managers</h3>
              <p className="text-xs text-slate-500">Provision Hotel Managers and Front Desk Staff accounts with property bindings.</p>
            </div>
            <Button onClick={() => setShowAddUserModal(true)}>
              <UserPlus className="w-4 h-4 mr-1.5" /> Provision New Team Member
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Team Member</th>
                    <th className="px-6 py-4">RBAC Role</th>
                    <th className="px-6 py-4">Assigned Hotel Property</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teamUsers.map((member) => (
                    <tr key={member._id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar avatarId={member.avatar_url} size="sm" />
                          <div>
                            <p className="font-bold text-slate-900">{member.full_name || member.email.split('@')[0]}</p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          member.role === 'super_admin' ? 'bg-amber-100 text-amber-800' :
                          member.role === 'hotel_manager' ? 'bg-blue-100 text-blue-800' :
                          member.role === 'staff' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {member.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                        {member.hotel_id?.name || (member.role === 'super_admin' ? 'All 6 Properties' : 'Unassigned')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {member.role !== 'super_admin' && (
                          <button
                            onClick={() => handleDeleteUser(member._id)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remove account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN ROOM & CONCIERGE NOTES (FRONT DESK) */}
      {/* ========================================================================= */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Assign Room & Concierge Notes</h3>
                <p className="text-xs text-slate-500">Guest: {editingBooking.guest_name}</p>
              </div>
              <button onClick={() => setEditingBooking(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBookingDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Room Number / Key
                </label>
                <Input
                  value={assignRoomNumber}
                  onChange={(e) => setAssignRoomNumber(e.target.value)}
                  placeholder="e.g. 101, 204, 302"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Requests / Concierge Log
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. High floor requested, airport cab needed at 8 AM, anniversary setup..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 min-h-[90px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingBooking(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={savingDetails}>
                  {savingDetails ? 'Saving...' : 'Save & Update'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW HOTEL PROPERTY (SUPER ADMIN) */}
      {/* ========================================================================= */}
      {showAddHotelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Luxury Hotel Property</h3>
                <p className="text-xs text-slate-500">Add a new destination to the PARADISE Palace catalog.</p>
              </div>
              <button onClick={() => setShowAddHotelModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHotel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hotel Property Name</label>
                <Input
                  value={hotelForm.name}
                  onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                  placeholder="e.g. Paradise Mountain Resort & Spa"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location Address / City</label>
                <Input
                  value={hotelForm.address}
                  onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                  placeholder="e.g. Mall Road, Shimla, Himachal Pradesh, 171001"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Property Description</label>
                <textarea
                  value={hotelForm.description}
                  onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })}
                  placeholder="Exquisite luxury retreat overlooking Himalayan pine valleys..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
                  <Input
                    type="email"
                    value={hotelForm.contact_email}
                    onChange={(e) => setHotelForm({ ...hotelForm, contact_email: e.target.value })}
                    placeholder="shimla@paradisepalace.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <Input
                    value={hotelForm.contact_phone}
                    onChange={(e) => setHotelForm({ ...hotelForm, contact_phone: e.target.value })}
                    placeholder="+91-177-2222-3333"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setShowAddHotelModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={hotelSubmitting}>
                  {hotelSubmitting ? 'Creating Property...' : 'Create Hotel Property'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD ROOM SUITE (SUPER ADMIN & MANAGER) */}
      {/* ========================================================================= */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Room Suite Category</h3>
                <p className="text-xs text-slate-500">Provision presidential suites, deluxe suites, or chalets.</p>
              </div>
              <button onClick={() => setShowAddRoomModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Hotel Property</label>
                <select
                  value={roomForm.hotel_id || (isManager && assignedHotel ? assignedHotel.id || assignedHotel._id : '')}
                  onChange={(e) => setRoomForm({ ...roomForm, hotel_id: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  required
                >
                  <option value="">Select Hotel...</option>
                  {hotels.map((h) => (
                    <option key={h.id || h._id} value={h.id || h._id}>
                      {h.name} ({h.address?.split(',')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Room Suite Name</label>
                <Input
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  placeholder="e.g. Maharaja Royal Presidential Suite"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price Per Night (₹)</label>
                  <Input
                    type="number"
                    value={roomForm.price_per_night}
                    onChange={(e) => setRoomForm({ ...roomForm, price_per_night: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Guest Capacity</label>
                  <Input
                    type="number"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Units</label>
                  <Input
                    type="number"
                    value={roomForm.total_units}
                    onChange={(e) => setRoomForm({ ...roomForm, total_units: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amenities (Comma separated)</label>
                <Input
                  value={roomForm.amenities}
                  onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })}
                  placeholder="King Bed, Balcony, WiFi, AC, Breakfast"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setShowAddRoomModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={roomSubmitting}>
                  {roomSubmitting ? 'Creating Room...' : 'Create Room Suite'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PROVISION TEAM MEMBER (SUPER ADMIN) */}
      {/* ========================================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Provision Team Member</h3>
                <p className="text-xs text-slate-500">Create Manager or Staff accounts assigned to a property.</p>
              </div>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <Input
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  placeholder="e.g. Vikramaditya Singh"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="vikram@paradisepalace.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Temporary Password</label>
                <Input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RBAC Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="hotel_manager">Hotel Manager</option>
                    <option value="staff">Front Desk Staff</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Property</label>
                  <select
                    value={userForm.hotel_id}
                    onChange={(e) => setUserForm({ ...userForm, hotel_id: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">Select Property...</option>
                    {hotels.map((h) => (
                      <option key={h.id || h._id} value={h.id || h._id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={userSubmitting}>
                  {userSubmitting ? 'Provisioning...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
