import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

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
        const { plan, userId, priceId } = await req.json();

        if (!userId || !priceId) {
            return new Response(JSON.stringify({ error: "userId and priceId are required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const sbUrl = Deno.env.get("SUPABASE_URL");
        const sbKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

        console.log("Debug: Checking Env Vars");
        console.log("SUPABASE_URL exists:", !!sbUrl);
        console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!sbKey);
        console.log("STRIPE_SECRET_KEY exists:", !!stripeKey);

        if (!sbUrl || !sbKey || !stripeKey) {
            throw new Error("Missing required environment variables: " +
                (!sbUrl ? "SUPABASE_URL " : "") +
                (!sbKey ? "SUPABASE_SERVICE_ROLE_KEY " : "") +
                (!stripeKey ? "STRIPE_SECRET_KEY" : "")
            );
        }

        const supabase = createClient(sbUrl, sbKey);

        // 1. Get user profile to check for stripe_customer_id
        const { data: userProfile, error: profileError } = await supabase
            .from("users")
            .select("stripe_customer_id, email")
            .eq("user_id", userId)
            .maybeSingle();

        if (profileError) throw profileError;

        let stripeCustomerId = userProfile?.stripe_customer_id;

        // 2. Create Stripe Customer if not exists
        if (!stripeCustomerId) {
            // Get user email from auth.users if not in our profile
            let email = userProfile?.email;
            if (!email) {
                const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userId);
                if (authError) throw authError;
                email = user?.email;
            }

            const customer = await stripe.customers.create({
                email,
                metadata: { supabase_user_id: userId },
            });
            stripeCustomerId = customer.id;

            // Save to DB
            const { error: updateError } = await supabase
                .from("users")
                .update({ stripe_customer_id: stripeCustomerId })
                .eq("user_id", userId);

            if (updateError) throw updateError;
        }

        // 3. Create a Subscription
        // payment_behavior='default_incomplete' ensures we get a setup_intent or payment_intent
        const subscription = await stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [{ price: priceId }],
            payment_behavior: "default_incomplete",
            payment_settings: { save_default_payment_method: "on_subscription" },
            expand: ["latest_invoice.payment_intent"],
            metadata: {
                user_id: userId,
                plan: plan,
            },
        });

        // @ts-ignore
        const clientSecret = subscription.latest_invoice.payment_intent.client_secret;

        return new Response(JSON.stringify({
            subscriptionId: subscription.id,
            clientSecret: clientSecret
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error creating subscription intent:", error);
        return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
