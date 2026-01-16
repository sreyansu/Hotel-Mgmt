import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Razorpay from "https://esm.sh/razorpay@2.9.2?target=deno"

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
}

// ENV
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")

if (
    !SUPABASE_URL ||
    !SUPABASE_ANON_KEY ||
    !SUPABASE_SERVICE_ROLE_KEY ||
    !RAZORPAY_KEY_ID ||
    !RAZORPAY_KEY_SECRET
) {
    throw new Error("Missing required environment variables")
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders })
    }

    try {
        /* 1️⃣ Verify user */
        const authClient = createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Authorization: req.headers.get("Authorization") ?? "",
                    },
                },
            }
        )

        const {
            data: { user },
        } = await authClient.auth.getUser()

        if (!user) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: corsHeaders }
            )
        }

        /* 2️⃣ DB client */
        const supabase = createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY
        )

        /* 3️⃣ Body */
        const { roomId, checkIn, checkOut, couponCode } = await req.json()

        if (!roomId || !checkIn || !checkOut) {
            throw new Error("Missing required fields")
        }

        const startDate = new Date(checkIn)
        const endDate = new Date(checkOut)

        if (
            isNaN(startDate.getTime()) ||
            isNaN(endDate.getTime()) ||
            endDate <= startDate
        ) {
            throw new Error("Invalid booking dates")
        }

        const nights = Math.ceil(
            (endDate.getTime() - startDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )

        /* 4️⃣ Room */
        const { data: room } = await supabase
            .from("rooms")
            .select("price_per_night")
            .eq("id", roomId)
            .single()

        if (!room) {
            throw new Error("Room not found")
        }

        let baseAmount = Number(room.price_per_night) * nights

        /* 5️⃣ Coupon */
        let discountAmount = 0
        if (couponCode) {
            const { data: coupon } = await supabase
                .from("coupons")
                .select("discount_percent")
                .eq("code", couponCode.toUpperCase())
                .eq("is_active", true)
                .single()

            if (coupon?.discount_percent) {
                discountAmount = (baseAmount * coupon.discount_percent) / 100
            }
        }

        const discountedAmount = baseAmount - discountAmount
        const gst = discountedAmount * 0.18
        const finalAmountPaise = Math.round((discountedAmount + gst) * 100)

        if (finalAmountPaise <= 0) {
            throw new Error("Invalid payment amount")
        }

        /* 6️⃣ Razorpay */
        const razorpay = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET,
        })

        const order = await razorpay.orders.create({
            amount: finalAmountPaise,
            currency: "INR",
            receipt: `booking_${Date.now()}`,
            notes: {
                roomId,
                userId: user.id,
                couponCode: couponCode ?? "",
            },
        })

        return new Response(JSON.stringify(order), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
    } catch (err: any) {
        console.error("❌ create-payment-intent error:", err)
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 400, headers: corsHeaders }
        )
    }
})