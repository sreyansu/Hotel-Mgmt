import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, CreditCard, ArrowLeft, Calendar, MapPin, Bed, Tag } from "lucide-react";
import { DateRangePicker } from "../components/ui/DateRangePicker";
import type { DateRange } from "react-day-picker";

interface Room {
    id: string;
    name: string;
    price_per_night: number;
    capacity: number;
    hotel: {
        id: string;
        name: string;
        address: string;
    };
}

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const roomId = searchParams.get("roomId");
    const urlCheckIn = searchParams.get("checkIn");
    const urlCheckOut = searchParams.get("checkOut");

    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        if (urlCheckIn && urlCheckOut) {
            return {
                from: new Date(urlCheckIn),
                to: new Date(urlCheckOut),
            };
        }
        return undefined;
    });

    const [guests, setGuests] = useState(1);
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [guestPhone, setGuestPhone] = useState("");

    const [couponCode, setCouponCode] = useState("");
    const [discountPercent, setDiscountPercent] = useState(0);
    const [couponError, setCouponError] = useState("");
    const [couponSuccess, setCouponSuccess] = useState("");

    useEffect(() => {
        if (!roomId) {
            navigate("/hotels");
            return;
        }

        const loadData = async () => {
            const { data: roomData, error } = await supabase
                .from("rooms")
                .select("*, hotel:hotels(*)")
                .eq("id", roomId)
                .single();

            if (error || !roomData) {
                navigate("/hotels");
                return;
            }

            setRoom(roomData as Room);

            const { data } = await supabase.auth.getUser();
            if (!data.user) {
                navigate(`/login?redirect=${location.pathname}${location.search}`);
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, email, phone")
                .eq("id", data.user.id)
                .single();

            if (profile) {
                setGuestName(profile.full_name || "");
                setGuestEmail(profile.email || data.user.email || "");
                setGuestPhone(profile.phone || "");
            }

            setLoading(false);
        };

        loadData();
    }, [roomId]);

    const handleApplyCoupon = async () => {
        setCouponError("");
        setCouponSuccess("");
        setDiscountPercent(0);

        if (!couponCode.trim()) return;

        const { data, error } = await supabase
            .from("coupons")
            .select("discount_percent")
            .eq("code", couponCode.toUpperCase())
            .eq("is_active", true)
            .single();

        if (error || !data) {
            setCouponError("Invalid or expired coupon");
        } else {
            setDiscountPercent(data.discount_percent);
            setCouponSuccess(`Coupon applied: ${data.discount_percent}% OFF`);
        }
    };

    const calculateDisplayTotal = () => {
        if (!room || !dateRange?.from || !dateRange?.to) {
            return { base: 0, tax: 0, total: 0, discount: 0, nights: 0 };
        }

        const nights = Math.ceil(
            (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (nights <= 0) {
            return { base: 0, tax: 0, total: 0, discount: 0, nights: 0 };
        }

        const base = nights * room.price_per_night;
        const discount = (base * discountPercent) / 100;
        const discounted = base - discount;
        const tax = discounted * 0.18;
        const total = discounted + tax;

        return { base, tax, total, discount, nights };
    };

    const handlePayment = async () => {
        if (!room || !dateRange?.from || !dateRange?.to) return;

        setProcessing(true);

        try {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                navigate("/login");
                return;
            }

            const checkIn = dateRange.from.toISOString().split("T")[0];
            const checkOut = dateRange.to.toISOString().split("T")[0];

            const response = await fetch(
                `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.supabase.co/functions/v1/create-payment-intent`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${data.session.access_token}`,
                    },
                    body: JSON.stringify({
                        roomId: room.id,
                        checkIn,
                        checkOut,
                        couponCode: couponCode || null,
                    }),
                }
            );

            const order = await response.json();

            if (!response.ok) {
                throw new Error(order.error || "Payment initiation failed");
            }

            const rzp = new (window as any).Razorpay({
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Grand Hotels",
                description: `Booking for ${room.name}`,
                image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100",
                order_id: order.id,
                prefill: {
                    name: guestName,
                    email: guestEmail,
                    contact: guestPhone,
                },
                handler: () => {
                    alert("Payment successful!");
                    navigate("/bookings");
                },
                modal: {
                    confirm_close: true,
                },
                theme: {
                    color: "#16a34a",
                },
            });

            rzp.open();
        } catch (err: any) {
            alert(err.message || "Payment failed");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="py-20 text-center">Loading checkout…</div>;
    if (!room) return null;

    const { base, tax, total, discount, nights } = calculateDisplayTotal();

    const formatDate = (date: Date) =>
        date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2 pl-0 hover:bg-transparent">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Hotel
                    </Button>
                    <h1 className="text-3xl font-bold text-slate-900">Secure Checkout</h1>
                    <p className="text-slate-600 mt-1">Complete your booking in just a few steps</p>
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
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    placeholder="john@example.com"
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
                                    placeholder="Enter coupon code"
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
                                            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200"
                                            alt={room.hotel.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 truncate">{room.hotel.name}</h3>
                                        <p className="text-sm text-slate-600 flex items-center mt-1">
                                            <Bed className="h-3 w-3 mr-1" /> {room.name}
                                        </p>
                                        <p className="text-xs text-slate-500 flex items-center mt-1 truncate">
                                            <MapPin className="h-3 w-3 mr-1" /> {room.hotel.address}
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
                                    {processing ? "Processing…" : `Pay ₹${total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                                </Button>

                                <p className="text-xs text-center text-slate-500">
                                    🔒 Secure payment powered by Razorpay
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};