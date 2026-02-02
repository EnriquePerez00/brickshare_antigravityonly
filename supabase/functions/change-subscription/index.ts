import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { userId, newPriceId, newPlanName } = await req.json();

        if (!userId || !newPriceId) {
            return new Response(JSON.stringify({ error: "userId and newPriceId are required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const sbUrl = Deno.env.get("SUPABASE_URL");
        const sbKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!sbUrl || !sbKey) {
            throw new Error("Missing Supabase environment variables");
        }

        const supabase = createClient(sbUrl, sbKey);

        // 1. Get user profile
        const { data: userProfile, error: profileError } = await supabase
            .from("users")
            .select("stripe_customer_id")
            .eq("user_id", userId)
            .maybeSingle();

        if (profileError || !userProfile?.stripe_customer_id) {
            throw new Error("User has no Stripe Customer ID or profile not found");
        }

        const customerId = userProfile.stripe_customer_id;

        // 2. Find Active Subscription
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: "active",
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            throw new Error("No active subscription found to update");
        }

        const currentSubscription = subscriptions.data[0];
        const currentItemId = currentSubscription.items.data[0].id;

        // 3. Check for Upgrade/Downgrade (Preview Invoice)
        // We simulate the update to see the cost
        const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
            customer: customerId,
            subscription: currentSubscription.id,
            subscription_items: [{
                id: currentItemId,
                price: newPriceId,
            }],
            subscription_proration_behavior: 'always_invoice',
        });

        const amountDue = upcomingInvoice.amount_due;
        const currency = upcomingInvoice.currency;

        console.log(`Update preview: amount_due=${amountDue} ${currency}`);

        if (amountDue > 0) {
            // UPGRADE: Charge the difference immediately
            const updatedSubscription = await stripe.subscriptions.update(currentSubscription.id, {
                items: [{
                    id: currentItemId,
                    price: newPriceId,
                }],
                proration_behavior: 'always_invoice',
                payment_behavior: 'pending_if_incomplete',
                expand: ['latest_invoice.payment_intent'],
                metadata: {
                    user_id: userId,
                    plan: newPlanName,
                    type: "upgrade"
                }
            });

            // @ts-ignore
            const clientSecret = updatedSubscription.latest_invoice.payment_intent.client_secret;

            return new Response(JSON.stringify({
                action: 'upgrade',
                clientSecret: clientSecret,
                amount: amountDue
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });

        } else if (amountDue < 0) {
            // DOWNGRADE: Process Refund
            // 1. Update subscription first
            await stripe.subscriptions.update(currentSubscription.id, {
                items: [{
                    id: currentItemId,
                    price: newPriceId,
                }],
                proration_behavior: 'always_invoice',
                metadata: {
                    user_id: userId,
                    plan: newPlanName,
                    type: "downgrade"
                }
            });

            // 2. Calculate refund amount (absolute value)
            const refundAmount = Math.abs(amountDue);

            // 3. Find a charge to refund (latest successful charge)
            const charges = await stripe.charges.list({
                customer: customerId,
                limit: 1,
            });

            let refundId = null;
            if (charges.data.length > 0) {
                const lastCharge = charges.data[0];
                try {
                    const refund = await stripe.refunds.create({
                        charge: lastCharge.id,
                        amount: refundAmount, // Refund the difference
                        metadata: {
                            reason: "Downgrade difference refund"
                        }
                    });
                    refundId = refund.id;
                } catch (e) {
                    console.error("Refund failed:", e);
                    // If refund fails (e.g., charge too old or already refunded), we log it but don't fail the request entirely
                    // Ideally we would return a warning
                }
            }

            // Update local DB profile immediately for downgrade as there is no payment confirmation flow
            await supabase
                .from("users")
                .update({
                    subscription_type: newPlanName,
                    // Status remains active
                })
                .eq("user_id", userId);

            return new Response(JSON.stringify({
                action: 'downgrade',
                message: 'Subscription updated and refund processed',
                refundId: refundId
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });

        } else {
            // No price change (Same price or exact wash)
            // Just update
            await stripe.subscriptions.update(currentSubscription.id, {
                items: [{
                    id: currentItemId,
                    price: newPriceId,
                }],
                metadata: {
                    user_id: userId,
                    plan: newPlanName
                }
            });

            await supabase
                .from("users")
                .update({ subscription_type: newPlanName })
                .eq("user_id", userId);

            return new Response(JSON.stringify({
                action: 'no_charge',
                message: 'Subscription updated'
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

    } catch (error) {
        console.error("Error changing subscription:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
