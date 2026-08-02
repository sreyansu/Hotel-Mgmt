import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { DateRangePicker } from "../components/ui/DateRangePicker";
import type { DateRange } from "react-day-picker";
import {
    Calendar,
    Users,
    Tag,
    CreditCard,
    ArrowLeft,
    MapPin,
    Bed,
    CheckCircle2,
} from "lucide-react";

interface Hotel {
    id: string;
    name: string;
    address: string;
    images: string[];
}

interface Room {
    id: string;
    name: string;
    price_per_night: number;
    capacity: number;
    images: string[];
    hotel: Hotel;
}

export const CheckoutPage = () => {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId");
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");

    const navigate = useNavigate();
    const { user } = useAuth();

    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

    // Form state
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [guests, setGuests] = useState(1);

    // Date state
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        if (checkInParam && checkOutParam) {
            return {
                from: new Date(checkInParam),
                to: new Date(checkOutParam),
            };
        }
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 3);
        return { from: tomorrow, to: dayAfter };
    });

    // Coupon state
    const [couponCode, setCouponCode] = useState("");
    const [discountPercent, setDiscountPercent] = useState(0);
    const [couponError, setCouponError] = useState("");
    const [couponSuccess, setCouponSuccess] = useState("");

    useEffect(() => {
        if (user) {
            setGuestName(user.full_name || "");
            setGuestEmail(user.email || "");
            setGuestPhone(user.phone || "");
        }
    }, [user]);

    useEffect(() => {
        if (!roomId) {
            navigate("/hotels");
            return;
        }

        const loadData = async () => {
            try {
                const data = await api.get(`/hotels/rooms/details/${roomId}`);
                if (data?.room) {
                    setRoom(data.room);
                } else {
                    navigate("/hotels");
                }
            } catch (err) {
                console.error("Error loading room for checkout:", err);
                navigate("/hotels");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [roomId, navigate]);

    const handleApplyCoupon = async () => {
        setCouponError("");
        setCouponSuccess("");
        setDiscountPercent(0);

        if (!couponCode.trim()) return;

        try {
            const data = await api.get(`/coupons/validate/${couponCode.toUpperCase().trim()}`);
            if (data?.valid) {
                setDiscountPercent(data.discount_percent);
                setCouponSuccess(`Coupon applied: ${data.discount_percent}% OFF!`);
            }
        } catch (err: any) {
            setCouponError(err.message || "Invalid or expired coupon code");
        }
    };

    const calculateDisplayTotal = () => {
        if (!room || !dateRange?.from || !dateRange?.to) {
            return { base: 0, tax: 0, total: 0, discount: 0, nights: 0 };
        }

        const nights = Math.max(
            1,
            Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
        );

        const base = nights * room.price_per_night;
        const discount = (base * discountPercent) / 100;
        const discounted = base - discount;
        const tax = discounted * 0.18;
        const total = discounted + tax;

        return { base, tax, total, discount, nights };
    };

    const handlePayment = async () => {
        if (!room || !dateRange?.from || !dateRange?.to) return;
        if (!guestName || !guestEmail) {
            alert("Please fill in your name and email address.");
            return;
        }

        setProcessing(true);

        try {
            const { total } = calculateDisplayTotal();
            const checkIn = dateRange.from.toISOString().split("T")[0];
            const checkOut = dateRange.to.toISOString().split("T")[0];

            const response = await api.post("/bookings", {
                hotel_id: room.hotel.id,
                room_id: room.id,
                check_in_date: checkIn,
                check_out_date: checkOut,
                total_price: total,
                guest_name: guestName,
                guest_email: guestEmail,
                guest_phone: guestPhone,
                payment_status: "paid",
            });

            if (response?.booking?.id) {
                setSuccessBookingId(response.booking.id);
            }
        } catch (err: any) {
            alert(err.message || "Booking failed. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="py-20 text-center text-slate-600">Loading checkout...</div>;
    if (!room) return null;

    const { base, tax, total, discount, nights } = calculateDisplayTotal();

    const formatDate = (date: Date) =>
        date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    if (successBookingId) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-lg w-full p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Reservation Confirmed!</h2>
                    <p className="text-slate-600 mb-6">
                        Thank you, <span className="font-semibold text-slate-900">{guestName}</span>. Your stay at{" "}
                        <span className="font-semibold text-slate-900">{room.hotel.name}</span> has been confirmed.
                    </p>

                    <div className="bg-slate-50 p-4 rounded-xl text-left text-sm space-y-2 mb-6 border border-slate-200">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Booking ID:</span>
                            <span className="font-mono font-medium text-slate-900 text-xs">{successBookingId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Room:</span>
                            <span className="font-medium text-slate-900">{room.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Dates:</span>
                            <span className="font-medium text-slate-900">
                                {dateRange?.from ? formatDate(dateRange.from) : ""} &rarr;{" "}
                                {dateRange?.to ? formatDate(dateRange.to) : ""}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                            <span>Amount Paid:</span>
                            <span>₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" className="flex-1" onClick={() => navigate("/hotels")}>
                            Browse More
                        </Button>
                        <Button className="flex-1" onClick={() => navigate("/bookings")}>
                            My Bookings
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2 pl-0 hover:bg-transparent">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Hotel
                    </Button>
                    <h1 className="text-3xl font-bold text-slate-900">Secure Checkout</h1>
                    <p className="text-slate-600 mt-1">Complete your reservation seamlessly</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN - Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Guest Information */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-900">
                                <Users className="mr-2 h-5 w-5 text-blue-600" /> Guest Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Full Name"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    required
                                />
                                <Input
                                    label="Phone Number"
                                    type="tel"
                                    value={guestPhone}
                                    onChange={(e) => setGuestPhone(e.target.value)}
                                    placeholder="+91 9876543210"
                                />
                                <Input
                                    label="Number of Guests"
                                    type="number"
                                    min={1}
                                    max={room.capacity}
                                    value={guests}
                                    onChange={(e) => setGuests(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Stay Details */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-900">
                                <Calendar className="mr-2 h-5 w-5 text-blue-600" /> Stay Details
                            </h2>
                            <DateRangePicker date={dateRange} setDate={setDateRange} />
                            <p className="text-xs text-slate-500 mt-2">
                                Select your check-in and check-out dates
                            </p>
                        </div>

                        {/* Coupon Code */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-900">
                                <Tag className="mr-2 h-5 w-5 text-blue-600" /> Apply Coupon
                            </h2>
                            <div className="flex gap-3">
                                <Input
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. WELCOME10, SUMMER20, LUXURY25"
                                    className="flex-1"
                                />
                                <Button variant="outline" onClick={handleApplyCoupon} className="shrink-0">
                                    Apply
                                </Button>
                            </div>
                            {couponError && <p className="text-sm text-red-500 mt-2">{couponError}</p>}
                            {couponSuccess && (
                                <p className="text-sm text-green-600 mt-2 font-medium">{couponSuccess}</p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-6 overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                <h2 className="text-lg font-semibold text-white">Booking Summary</h2>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Hotel & Room Info */}
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={room.hotel?.images?.[0] || room.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200"}
                                            alt={room.hotel?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 truncate">{room.hotel?.name}</h3>
                                        <p className="text-sm text-slate-600 flex items-center mt-1">
                                            <Bed className="h-3 w-3 mr-1" /> {room.name}
                                        </p>
                                        <p className="text-xs text-slate-500 flex items-center mt-1 truncate">
                                            <MapPin className="h-3 w-3 mr-1" /> {room.hotel?.address}
                                        </p>
                                    </div>
                                </div>

                                {/* Stay Details */}
                                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Check-in</span>
                                        <span className="font-medium text-slate-900">
                                            {dateRange?.from ? formatDate(dateRange.from) : "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Check-out</span>
                                        <span className="font-medium text-slate-900">
                                            {dateRange?.to ? formatDate(dateRange.to) : "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Duration</span>
                                        <span className="font-medium text-slate-900">
                                            {nights > 0 ? `${nights} Night${nights > 1 ? "s" : ""}` : "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Guests</span>
                                        <span className="font-medium text-slate-900">{guests} Guest{guests > 1 ? "s" : ""}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t border-slate-200 pt-3">
                                        <span className="text-slate-600">Room Capacity</span>
                                        <span className="text-slate-900">Up to {room.capacity}</span>
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-slate-900">Price Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">
                                                ₹{room.price_per_night.toLocaleString("en-IN")} × {nights} night{nights > 1 ? "s" : ""}
                                            </span>
                                            <span className="text-slate-900">₹{base.toLocaleString("en-IN")}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span className="flex items-center">
                                                    Coupon Discount
                                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                        {discountPercent}% OFF
                                                    </span>
                                                </span>
                                                <span>−₹{discount.toLocaleString("en-IN")}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Taxes & Fees (GST 18%)</span>
                                            <span className="text-slate-900">₹{tax.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-200 pt-3">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span className="text-slate-900">Total Amount</span>
                                            <span className="text-slate-900">₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Inclusive of all taxes</p>
                                    </div>
                                </div>

                                {/* Pay Button */}
                                <Button
                                    className="w-full h-12 text-base bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
                                    disabled={processing || total <= 0}
                                    onClick={handlePayment}
                                >
                                    <CreditCard className="mr-2 h-5 w-5" />
                                    {processing ? "Processing..." : `Confirm & Pay ₹${total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                                </Button>

                                <p className="text-xs text-center text-slate-500">
                                    🔒 Instant Confirmation & RBAC Managed Booking
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};