import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

// Helper function to get default payment method
async function getDefaultPaymentMethod(customerId: string): Promise<string | null> {
    try {
        const customer = await stripe.customers.retrieve(customerId, {
            expand: ['invoice_settings.default_payment_method']
        });

        if (customer.deleted) return null;

        const defaultPM = customer.invoice_settings?.default_payment_method;

        if (typeof defaultPM === 'string') {
            return defaultPM;
        } else if (defaultPM && typeof defaultPM === 'object') {
            return defaultPM.id;
        }

        // Fallback: buscar el payment method más reciente
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
            limit: 1
        });

        return paymentMethods.data[0]?.id || null;
    } catch (error) {
        console.error("Error retrieving payment method:", error);
        return null;
    }
}

// Helper function to cancel a payment intent authorization
async function cancelPaymentIntent(paymentIntentId: string): Promise<void> {
    try {
        await stripe.paymentIntents.cancel(paymentIntentId);
        console.log(`Cancelled PaymentIntent: ${paymentIntentId}`);
    } catch (error) {
        console.error(`Failed to cancel PaymentIntent ${paymentIntentId}:`, error);
    }
}

serve(async (req) => {
    const origin = req.headers.get("origin") || "";
    const corsHeaders = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Credentials": "true",
    };

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { userId, setRef, setPrice } = await req.json();

        if (!userId || !setRef) {
            return new Response(JSON.stringify({
                success: false,
                error: "userId y setRef son requeridos",
                errorCode: "invalid_parameters"
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Use default price of 100 EUR if not provided or null
        const finalSetPrice = setPrice || 100.00;

        const sbUrl = Deno.env.get("SUPABASE_URL");
        const sbKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!sbUrl || !sbKey) {
            throw new Error("Missing Supabase environment variables");
        }

        const supabase = createClient(sbUrl, sbKey);

        // 1. Get user profile and stripe_customer_id
        const { data: userProfile, error: profileError } = await supabase
            .from("users")
            .select("stripe_customer_id, email, full_name")
            .eq("user_id", userId)
            .maybeSingle();

        if (profileError) {
            throw profileError;
        }

        if (!userProfile?.stripe_customer_id) {
            return new Response(JSON.stringify({
                success: false,
                error: "Usuario no tiene Customer ID de Stripe configurado",
                errorCode: "no_stripe_customer",
                failedOperation: "customer_validation",
                userEmail: userProfile?.email
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const stripeCustomerId = userProfile.stripe_customer_id;

        // 2. Get default payment method
        const paymentMethod = await getDefaultPaymentMethod(stripeCustomerId);

        if (!paymentMethod) {
            return new Response(JSON.stringify({
                success: false,
                error: "Usuario no tiene método de pago configurado",
                errorCode: "no_payment_method",
                failedOperation: "customer_validation",
                userEmail: userProfile.email
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 3. FIRST: Create PaymentIntent for Deposit (Fianza) - Authorization only
        const depositAmount = Math.round(finalSetPrice * 100); // Convert to cents
        let depositPaymentIntent;

        try {
            depositPaymentIntent = await stripe.paymentIntents.create({
                amount: depositAmount,
                currency: "eur",
                customer: stripeCustomerId,
                payment_method: paymentMethod,
                off_session: true,
                confirm: true,
                capture_method: "manual", // Authorization only, no capture
                description: `Fianza por set ${setRef}`,
                metadata: {
                    user_id: userId,
                    set_ref: setRef,
                    type: "deposit"
                }
            });

            console.log(`Deposit authorization created: ${depositPaymentIntent.id}, status: ${depositPaymentIntent.status}`);

            // Check if authorization was successful
            if (depositPaymentIntent.status !== "requires_capture") {
                throw new Error(`Deposit authorization failed with status: ${depositPaymentIntent.status}`);
            }

        } catch (error: any) {
            console.error("Deposit authorization failed:", error);

            let errorCode = "stripe_error";
            if (error.code === "insufficient_funds" || error.decline_code === "insufficient_funds") {
                errorCode = "insufficient_funds";
            } else if (error.code === "card_declined" || error.type === "card_error") {
                errorCode = "card_declined";
            }

            return new Response(JSON.stringify({
                success: false,
                error: error.message || "Error al autorizar la fianza",
                errorCode: errorCode,
                failedOperation: "deposit",
                userEmail: userProfile.email
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 4. SECOND: Create PaymentIntent for Transport - Immediate charge
        let transportPaymentIntent;

        try {
            transportPaymentIntent = await stripe.paymentIntents.create({
                amount: 1000, // 10.00 EUR
                currency: "eur",
                customer: stripeCustomerId,
                payment_method: paymentMethod,
                off_session: true,
                confirm: true,
                capture_method: "automatic", // Immediate capture
                description: `Gastos de transporte - Set ${setRef}`,
                metadata: {
                    user_id: userId,
                    set_ref: setRef,
                    type: "transport"
                }
            });

            console.log(`Transport charge created: ${transportPaymentIntent.id}, status: ${transportPaymentIntent.status}`);

            // Check if charge was successful
            if (transportPaymentIntent.status !== "succeeded") {
                throw new Error(`Transport charge failed with status: ${transportPaymentIntent.status}`);
            }

        } catch (error: any) {
            console.error("Transport charge failed:", error);

            // ROLLBACK: Cancel the deposit authorization
            await cancelPaymentIntent(depositPaymentIntent.id);

            let errorCode = "stripe_error";
            if (error.code === "insufficient_funds" || error.decline_code === "insufficient_funds") {
                errorCode = "insufficient_funds";
            } else if (error.code === "card_declined" || error.type === "card_error") {
                errorCode = "card_declined";
            }

            return new Response(JSON.stringify({
                success: false,
                error: `Cobro de transporte falló: ${error.message}. Se canceló la autorización de fianza.`,
                errorCode: errorCode,
                failedOperation: "transport",
                userEmail: userProfile.email
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 5. Success: Both operations completed
        return new Response(JSON.stringify({
            success: true,
            depositPaymentIntentId: depositPaymentIntent.id,
            transportPaymentIntentId: transportPaymentIntent.id,
            depositAmount: depositAmount / 100,
            transportAmount: 10.00
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Error processing assignment payment:", error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || "Error inesperado al procesar el pago",
            errorCode: "stripe_error",
            failedOperation: "unknown"
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
