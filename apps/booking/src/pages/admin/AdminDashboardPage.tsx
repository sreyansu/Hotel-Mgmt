import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
    LayoutDashboard,
    Building2,
    CalendarCheck2,
    Tag,
    TrendingUp,
    Plus,
    RefreshCw,
    Search
} from 'lucide-react';

export const AdminDashboardPage = () => {
    const { user, role } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'hotels' | 'coupons'>('overview');

    // Data states
    const [bookings, setBookings] = useState<any[]>([]);
    const [hotels, setHotels] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter states
    const [bookingSearch, setBookingSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal/Form states
    const [newCouponCode, setNewCouponCode] = useState('');
    const [newCouponDiscount, setNewCouponDiscount] = useState('');
    const [couponMsg, setCouponMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const loadAllData = async () => {
        setRefreshing(true);
        try {
            const [bRes, hRes, cRes] = await Promise.all([
                api.get('/bookings/admin/all').catch(() => ({ bookings: [] })),
                api.get('/hotels').catch(() => ({ hotels: [] })),
                api.get('/coupons/admin/all').catch(() => ({ coupons: [] })),
            ]);

            setBookings(bRes?.bookings || []);
            setHotels(hRes?.hotels || []);
            setCoupons(cRes?.coupons || []);
        } catch (err) {
            console.error('Failed to load admin data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    // Update booking status handler
    const handleStatusChange = async (bookingId: string, newStatus: string) => {
        try {
            await api.patch(`/bookings/admin/${bookingId}/status`, { status: newStatus });
            setBookings((prev) =>
                prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
            );
        } catch (err: any) {
            alert(err.message || 'Failed to update booking status');
        }
    };

    // Toggle coupon active state
    const handleToggleCoupon = async (code: string, currentStatus: boolean) => {
        try {
            const res = await api.patch(`/coupons/admin/${code}/toggle`, { is_active: !currentStatus });
            if (res.coupon) {
                setCoupons((prev) =>
                    prev.map((c) => (c.code === code ? { ...c, is_active: res.coupon.is_active } : c))
                );
            }
        } catch (err: any) {
            alert(err.message || 'Failed to toggle coupon status');
        }
    };

    // Create coupon
    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        setCouponMsg(null);
        if (!newCouponCode || !newCouponDiscount) return;

        try {
            const res = await api.post('/coupons/admin', {
                code: newCouponCode,
                discount_percent: Number(newCouponDiscount),
            });
            if (res.coupon) {
                setCoupons([res.coupon, ...coupons]);
                setNewCouponCode('');
                setNewCouponDiscount('');
                setCouponMsg({ text: `Coupon ${res.coupon.code} created successfully!`, type: 'success' });
            }
        } catch (err: any) {
            setCouponMsg({ text: err.message || 'Failed to create coupon', type: 'error' });
        }
    };

    // Metrics calculations
    const totalRevenue = bookings
        .filter((b) => b.status !== 'cancelled')
        .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

    const totalRoomsCount = hotels.reduce((sum, h) => sum + (h.rooms_count || (h.rooms ? h.rooms.length : 0)), 0);

    const filteredBookings = bookings.filter((b) => {
        const matchesSearch =
            (b.guest_name || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
            (b.guest_email || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
            (b.id || '').toLowerCase().includes(bookingSearch.toLowerCase());
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'checked_in':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'checked_out':
                return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    return (
        <div className="min-h-[90vh] bg-slate-50">
            {/* Top Bar Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900">Admin Control Center</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                                {role}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Logged in as <span className="font-semibold text-slate-700">{user?.email}</span> (RBAC Active)
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadAllData}
                            disabled={refreshing}
                            className="text-slate-700 flex items-center gap-1.5"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-6 flex gap-6 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'bookings', label: `Bookings (${bookings.length})`, icon: CalendarCheck2 },
                        { id: 'hotels', label: `Hotels & Rooms (${hotels.length})`, icon: Building2 },
                        { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                                    active
                                        ? 'border-primary text-primary font-semibold'
                                        : 'border-transparent text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Contents */}
            <div className="container mx-auto px-6 py-8">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-sm text-slate-500 font-medium">Loading control center data...</p>
                    </div>
                ) : (
                    <>
                        {/* 1. OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-slate-900 mt-2">
                                    ₹{totalRevenue.toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs text-emerald-600 font-medium mt-1">From active reservations</p>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bookings</span>
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <CalendarCheck2 className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-slate-900 mt-2">{bookings.length}</p>
                                <p className="text-xs text-blue-600 font-medium mt-1">Across all properties</p>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Properties</span>
                                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-slate-900 mt-2">{hotels.length}</p>
                                <p className="text-xs text-amber-600 font-medium mt-1">{totalRoomsCount} Room Types</p>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Coupons</span>
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                        <Tag className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-slate-900 mt-2">
                                    {coupons.filter((c) => c.is_active).length}
                                </p>
                                <p className="text-xs text-purple-600 font-medium mt-1">Promo campaigns</p>
                            </div>
                        </div>

                        {/* Recent Bookings Snapshot */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-slate-900">Recent Reservations</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Latest guests and reservation details</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setActiveTab('bookings')}>
                                    View All
                                </Button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {bookings.slice(0, 5).map((b) => (
                                    <div key={b.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                                                {b.guest_name ? b.guest_name[0] : 'G'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">{b.guest_name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {b.hotels?.name || 'Hotel'} &bull; {b.check_in_date} to {b.check_out_date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 text-sm">₹{b.total_price?.toLocaleString('en-IN')}</p>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusColor(b.status)}`}>
                                                {b.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. BOOKINGS TAB */}
                {activeTab === 'bookings' && (
                    <div className="space-y-6">
                        {/* Search & Filter bar */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by guest, email, or ID..."
                                    value={bookingSearch}
                                    onChange={(e) => setBookingSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Status:</span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="all">All Bookings</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="checked_in">Checked In</option>
                                    <option value="checked_out">Checked Out</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="pending_payment">Pending Payment</option>
                                </select>
                            </div>
                        </div>

                        {/* Bookings Table */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                                        <th className="py-3.5 px-4">Booking ID</th>
                                        <th className="py-3.5 px-4">Guest</th>
                                        <th className="py-3.5 px-4">Property & Room</th>
                                        <th className="py-3.5 px-4">Dates</th>
                                        <th className="py-3.5 px-4">Amount</th>
                                        <th className="py-3.5 px-4">Status & Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {filteredBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-slate-400">
                                                No reservations found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredBookings.map((b) => (
                                            <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                                                    {b.id?.slice(-8) || b.id}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <p className="font-semibold text-slate-900">{b.guest_name}</p>
                                                    <p className="text-xs text-slate-500">{b.guest_email}</p>
                                                    {b.guest_phone && (
                                                        <p className="text-xs text-slate-400">{b.guest_phone}</p>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <p className="font-medium text-slate-800">{b.hotels?.name || 'Hotel'}</p>
                                                    <p className="text-xs text-slate-500">{b.rooms?.name || 'Room'}</p>
                                                </td>
                                                <td className="py-3.5 px-4 text-xs text-slate-700">
                                                    <span className="font-semibold">{b.check_in_date}</span> &rarr;{' '}
                                                    <span className="font-semibold">{b.check_out_date}</span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="font-bold text-slate-900">
                                                        ₹{b.total_price?.toLocaleString('en-IN')}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <select
                                                        value={b.status}
                                                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                                                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${getStatusColor(
                                                            b.status
                                                        )}`}
                                                    >
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="checked_in">Checked In</option>
                                                        <option value="checked_out">Checked Out</option>
                                                        <option value="cancelled">Cancelled</option>
                                                        <option value="pending_payment">Pending Payment</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. HOTELS & ROOMS TAB */}
                {activeTab === 'hotels' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Property Portfolio</h2>
                                <p className="text-xs text-slate-500">Manage hotels and room inventories</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {hotels.map((hotel) => (
                                <div key={hotel.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                                    <div className="h-44 bg-slate-200 relative overflow-hidden">
                                        <img
                                            src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
                                            alt={hotel.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-slate-800">
                                            {hotel.rooms_count || (hotel.rooms ? hotel.rooms.length : 0)} Room Types
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-slate-900 text-base">{hotel.name}</h3>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{hotel.address}</p>
                                        <p className="text-xs text-slate-600 mt-2 line-clamp-2">{hotel.description}</p>

                                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-1">
                                            {(hotel.amenities || []).map((amenity: string, i: number) => (
                                                <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. COUPONS TAB */}
                {activeTab === 'coupons' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Coupon list */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-lg font-bold text-slate-900">Active Discount Coupons</h2>
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="divide-y divide-slate-100">
                                    {coupons.map((c) => (
                                        <div key={c.code} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                                                    %
                                                </div>
                                                <div>
                                                    <p className="font-mono font-bold text-slate-900 tracking-wide text-base">
                                                        {c.code}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Discount: <span className="font-semibold text-emerald-600">{c.discount_percent}% OFF</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                                    c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {c.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleCoupon(c.code, c.is_active)}
                                                >
                                                    {c.is_active ? 'Deactivate' : 'Activate'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Create new coupon form */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-primary" /> Create New Coupon
                            </h3>

                            {couponMsg && (
                                <div className={`p-3 rounded-lg text-xs font-medium mb-4 ${
                                    couponMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                }`}>
                                    {couponMsg.text}
                                </div>
                            )}

                            <form onSubmit={handleCreateCoupon} className="space-y-4">
                                <Input
                                    label="Coupon Code"
                                    placeholder="e.g. FESTIVE30"
                                    value={newCouponCode}
                                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                                    required
                                />
                                <Input
                                    label="Discount Percentage (%)"
                                    type="number"
                                    min={1}
                                    max={100}
                                    placeholder="e.g. 30"
                                    value={newCouponDiscount}
                                    onChange={(e) => setNewCouponDiscount(e.target.value)}
                                    required
                                />
                                <Button type="submit" className="w-full">
                                    Create Coupon
                                </Button>
                            </form>
                        </div>
                    </div>
                )}
                    </>
                )}
            </div>
        </div>
    );
};
