import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Users, Check } from 'lucide-react';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import type { DateRange } from 'react-day-picker';

interface Room {
    id: string;
    name: string;
    description: string;
    price_per_night: number;
    capacity: number;
    images: string[];
    amenities: string[];
    total_units: number;
    available?: boolean;
}

interface Hotel {
    id: string;
    slug: string;
    name: string;
    description: string;
    address: string;
    images: string[];
    amenities: string[];
}

export const HotelDetailsPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize date range from URL params
    const location = useLocation();
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        const searchParams = new URLSearchParams(location.search);
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');

        if (checkIn && checkOut) {
            return {
                from: new Date(checkIn),
                to: new Date(checkOut)
            };
        }
        return undefined;
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (slug) fetchHotelDetails(slug);
    }, [slug]);

    const fetchHotelDetails = async (slug: string) => {
        try {
            const data = await api.get(`/hotels/${slug}`);
            if (!data?.hotel) {
                setError('Hotel not found');
            } else {
                setHotel(data.hotel);
                setRooms(
                    (data.rooms || []).map((room: any) => ({
                        ...room,
                        available: true,
                    }))
                );
            }
        } catch (err: any) {
            setError(err.message || 'Error loading hotel');
        } finally {
            setLoading(false);
        }
    };

    const handleBookRoom = (roomId: string) => {
        if (!dateRange?.from || !dateRange?.to) {
            alert('Please select check-in and check-out dates first.');
            return;
        }
        // Navigate to checkout with room query param
        const checkInStr = dateRange.from.toISOString();
        const checkOutStr = dateRange.to.toISOString();
        navigate(`/checkout?roomId=${roomId}&checkIn=${checkInStr}&checkOut=${checkOutStr}`);
    };

    if (loading) return <div className="text-center py-20">Loading hotel details...</div>;
    if (error || !hotel) return <div className="text-center py-20 text-red-500">{error || 'Hotel not found'}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate(-1)}>
                <Check className="h-4 w-4 mr-2 rotate-180" /> Back {/* Check icon usually isn't back, using ArrowLeft if available or generic */}
            </Button>
            {/* Hotel Header */}
            <div className="mb-8">
                <div className="h-[400px] rounded-xl overflow-hidden mb-6 relative">
                    <img
                        src={hotel.images?.[0] || 'https://placehold.co/1200x600?text=No+Image'}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                        <h1 className="text-4xl font-bold mb-2">{hotel.name}</h1>
                        <p className="flex items-center text-lg text-slate-200"><MapPin className="mr-2" /> {hotel.address}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">About this Hotel</h2>
                            <p className="text-slate-600 leading-relaxed">{hotel.description}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {hotel.amenities?.map((amenity, i) => (
                                    <div key={i} className="flex items-center text-slate-700">
                                        <Check className="h-4 w-4 mr-2 text-green-500" /> {amenity}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Available Rooms</h2>
                            <div className="grid grid-cols-1 gap-6">
                                {rooms.map(room => (
                                    <div key={room.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row">
                                        {/* Room Image */}
                                        <div className="md:w-1/3 h-48 md:h-auto overflow-hidden relative bg-slate-100">
                                            <img
                                                src={room.images?.[0] || 'https://placehold.co/800x400?text=Room+Image'}
                                                alt={room.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-900">{room.name}</h3>
                                                    <p className="text-sm text-slate-500 flex items-center mt-1">
                                                        <Users className="h-3 w-3 mr-1" /> Max {room.capacity} Guests
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-bold text-primary">₹{room.price_per_night}</span>
                                                    <span className="text-xs text-slate-500 block">/night</span>
                                                </div>
                                            </div>

                                            <p className="text-sm text-slate-600 mb-4 leading-relaxed flex-1">{room.description}</p>

                                            <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                {/* Room Amenities */}
                                                {room.amenities && room.amenities.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {room.amenities.slice(0, 3).map((amenity, idx) => (
                                                            <span key={idx} className="text-[10px] uppercase tracking-wider font-semibold bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100">
                                                                {amenity}
                                                            </span>
                                                        ))}
                                                        {room.amenities.length > 3 && (
                                                            <span className="text-[10px] uppercase tracking-wider font-semibold bg-slate-50 text-slate-400 px-2 py-1 rounded border border-slate-100">
                                                                +{room.amenities.length - 3} More
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : <div></div>}

                                                <Button
                                                    onClick={() => handleBookRoom(room.id)}
                                                    className="w-full sm:w-auto min-w-[140px]"
                                                    size="lg"
                                                    disabled={!room.available}
                                                >
                                                    {room.available ? 'Book Room' : 'Sold Out'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {rooms.length === 0 && (
                                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <p className="text-slate-500 font-medium">No rooms available for this hotel.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Room Selection */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 top-24 sticky z-20">
                            <h2 className="text-xl font-bold mb-4">Check Availability</h2>
                            <div className="mb-4">
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Select Dates</label>
                                <DateRangePicker
                                    date={dateRange}
                                    setDate={setDateRange}
                                />
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
};
