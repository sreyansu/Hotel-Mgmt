import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface Hotel {
    id: string;
    slug: string;
    name: string;
    address: string;
    images: string[];
    starting_price?: number;
}

export const LandingPage = () => {
    const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchLocation, setSearchLocation] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const navigate = useNavigate();

    useEffect(() => {
        fetchFeaturedHotels();
    }, []);

    const fetchFeaturedHotels = async () => {
        try {
            const data = await api.get('/hotels');
            if (data?.hotels) {
                setFeaturedHotels(data.hotels.slice(0, 6));
            }
        } catch (err) {
            console.error('Error fetching hotels:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchLocation) params.append('location', searchLocation);

        if (dateRange?.from) params.append('checkIn', format(dateRange.from, 'yyyy-MM-dd'));
        if (dateRange?.to) params.append('checkOut', format(dateRange.to, 'yyyy-MM-dd'));

        navigate(`/hotels?${params.toString()}`);
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)]">
            {/* Hero Section */}
            <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center bg-slate-900 text-white">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=3540&auto=format&fit=crop"
                        alt="Luxury Hotel"
                        className="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium tracking-wider mb-6 animate-fade-in-up">
                        LUXURY REDEFINED
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tighter animate-fade-in-up delay-100">
                        Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Perfect Stay</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
                        Experience world-class luxury and royal comfort at our signature PARADISE Palace Hotels across premier destinations.
                    </p>

                    <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-end text-left animate-fade-in-up delay-300">
                        <div className="flex-1 w-full relative">
                            <label className="text-xs font-semibold uppercase text-slate-300 mb-2 block tracking-wider">Location</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-white transition-colors" />
                                <input
                                    className="w-full pl-11 h-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:bg-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/30 outline-none transition-all"
                                    placeholder="Where are you going?"
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <label className="text-xs font-semibold uppercase text-slate-300 mb-2 block tracking-wider">Dates</label>
                            <DateRangePicker
                                date={dateRange}
                                setDate={setDateRange}
                                className="bg-white/5 rounded-xl"
                            />
                        </div>

                        <div className="w-full md:w-auto">
                            <Button size="lg" className="w-full h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/20 font-semibold tracking-wide transition-all transform hover:scale-105">
                                <Search className="mr-2 h-5 w-5" /> Search
                            </Button>
                        </div>
                    </form>
                </div>
            </section>

            
            {/* Featured Hotels */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">Featured Destinations</h2>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-lg" />)}
                        </div>
                    ) : featuredHotels.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {featuredHotels.map((hotel) => (
                                <Link to={`/hotels/${hotel.slug}`} key={hotel.id} className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                                    <div className="h-64 overflow-hidden relative">
                                        <img
                                            src={hotel.images?.[0] || 'https://placehold.co/600x400?text=No+Image'}
                                            alt={hotel.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                                            <h3 className="text-xl font-bold text-white">{hotel.name}</h3>
                                            <p className="text-slate-200 text-sm flex items-center gap-1"><MapPin className="h-3 w-3" /> {hotel.address}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 flex justify-between items-center bg-white border-t border-slate-100">
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium uppercase">Starting from</p>
                                            <p className="text-lg font-bold text-primary">₹{(hotel.starting_price || 4500).toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-500">/night</span></p>
                                        </div>
                                        <Button variant="outline" size="sm">View Details</Button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-10 bg-white rounded-lg border border-dashed border-slate-300">
                            <p>No featured hotels available at the moment.</p>
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link to="/hotels">
                            <Button variant="outline" size="lg">View All Hotels</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};
