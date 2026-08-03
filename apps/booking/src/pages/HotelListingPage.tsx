import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Search, Filter, ArrowLeft } from 'lucide-react';

interface Hotel {
    id: string;
    slug: string;
    name: string;
    address: string;
    images: string[];
    description: string;
    starting_price?: number;
}

export const HotelListingPage = () => {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const initialSearch = searchParams.get('location') || '';
    const [searchTerm, setSearchTerm] = useState(initialSearch);

    useEffect(() => {
        fetchHotels();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            setFilteredHotels(hotels.filter(h =>
                h.name.toLowerCase().includes(lower) ||
                h.address.toLowerCase().includes(lower) ||
                h.description?.toLowerCase().includes(lower)
            ));
        } else {
            setFilteredHotels(hotels);
        }
    }, [searchTerm, hotels]);

    const fetchHotels = async () => {
        try {
            const data = await api.get('/hotels');
            if (data?.hotels) {
                setHotels(data.hotels);
                setFilteredHotels(data.hotels);
            }
        } catch (err) {
            console.error('Error fetching hotels:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary flex items-center gap-2" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
            {/* Search Header */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                <h1 className="text-3xl font-bold mb-6 text-primary">Explore Hotels</h1>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by hotel name, city, or location..."
                            className="pl-9"
                        />
                    </div>
                    <Button variant="outline" className="shrink-0">
                        <Filter className="mr-2 h-4 w-4" /> Filters
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-lg" />)}
                </div>
            ) : filteredHotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHotels.map((hotel) => (
                        <Link to={`/hotels/${hotel.slug}${location.search}`} key={hotel.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md border border-slate-200 transition-all flex flex-col h-full group">
                            <div className="h-56 overflow-hidden relative bg-slate-200">
                                {hotel.images?.[0] ? (
                                    <img
                                        src={hotel.images[0]}
                                        alt={hotel.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">No Image</div>
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-primary shadow-sm">
                                    Featured
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-accent transition-colors">{hotel.name}</h3>
                                <p className="text-sm text-slate-500 flex items-start gap-1 mb-3">
                                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                    {hotel.address}
                                </p>
                                <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{hotel.description}</p>

                                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <div className="text-xs text-slate-500">
                                        From <span className="text-lg font-bold text-slate-900">₹{(hotel.starting_price || 4500).toLocaleString('en-IN')}</span>/night
                                    </div>
                                    <Button size="sm">View Details</Button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <h3 className="text-lg font-medium text-slate-900">No hotels found</h3>
                    <p className="text-slate-500">Try adjusting your search criteria.</p>
                    <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2 text-accent">Clear Search</Button>
                </div>
            )}
        </div>
    );
};
