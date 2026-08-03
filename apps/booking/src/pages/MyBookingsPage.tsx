/**
 * ==============================================================================
 * MY BOOKINGS PAGE (`/bookings`)
 * ==============================================================================
 * Displays the reservation history and active stays for the authenticated customer.
 * Features:
 * - Fetches reservations from `/api/bookings/my-bookings`.
 * - Status tags with color indicators (Confirmed, Checked In, Checked Out, Cancelled).
 * - Room and property details with dates and payment confirmation.
 */

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Bed, ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface BookingItem {
    id: string;
    hotel?: {
        name: string;
        slug: string;
        address: string;
        images: string[];
    };
    room?: {
        name: string;
        price_per_night: number;
        images: string[];
    };
    check_in_date: string;
    check_out_date: string;
    total_price: number;
    status: string;
    payment_status: string;
    guest_name: string;
    createdAt: string;
}

export const MyBookingsPage = () => {
    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMyBookings();
    }, []);

    // Retrieve user's personal booking history
    const fetchMyBookings = async () => {
        try {
            const data = await api.get('/bookings/my-bookings');
            if (data?.bookings) {
                setBookings(data.bookings);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    // Helper to render stylish status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                    </span>
                );
            case 'checked_in':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        <Clock className="w-3.5 h-3.5" /> Checked In
                    </span>
                );
            case 'checked_out':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        Completed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <XCircle className="w-3.5 h-3.5" /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl min-h-[80vh]">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Reservations</h1>
                    <p className="text-slate-600 mt-1">Manage and view your upcoming and past hotel stays</p>
                </div>
                <Link to="/hotels">
                    <Button>
                        Book Another Stay <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-36 bg-slate-100 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bed className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">No bookings yet</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        You haven't reserved any hotel rooms yet. Explore our luxury resorts and find your dream getaway!
                    </p>
                    <Link to="/hotels">
                        <Button>Browse Hotels</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="flex gap-4 items-start">
                                <div className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                    <img
                                        src={booking.hotel?.images?.[0] || booking.room?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
                                        alt={booking.hotel?.name || 'Hotel'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-slate-900">{booking.hotel?.name || 'Hotel Reservation'}</h3>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                    <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                                        <Bed className="w-4 h-4 text-slate-400" /> {booking.room?.name || 'Room'}
                                    </p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {booking.hotel?.address || ''}
                                    </p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Stay:{' '}
                                        <span className="font-semibold text-slate-700">
                                            {booking.check_in_date} &rarr; {booking.check_out_date}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end justify-between border-t md:border-t-0 pt-4 md:pt-0">
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Total Paid</p>
                                    <p className="text-xl font-bold text-slate-900">
                                        ₹{booking.total_price?.toLocaleString('en-IN')}
                                    </p>
                                    <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                                        {booking.payment_status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
