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
        "Content-Type": "application/json",
    };

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        console.log("Request Body received:", JSON.stringify(body));

        const { userId, newPriceId, newPlanName } = body;

        if (!userId || !newPriceId) {
            console.error("Missing required fields:", { userId, newPriceId });
            return new Response(JSON.stringify({ error: "userId and newPriceId are required", received: body }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const sbUrl = Deno.env.get("SUPABASE_URL");
        const sbKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!sbUrl || !sbKey) {
            throw new Error("Missing Supabase environment variables on server");
        }

        const supabase = createClient(sbUrl, sbKey);

        // 1. Get user profile
        console.log(`Fetching profile for user: ${userId}`);
        const { data: userProfile, error: profileError } = await supabase
            .from("users")
            .select("stripe_customer_id")
            .eq("user_id", userId)
            .maybeSingle();

        if (profileError) {
            console.error("Supabase profile error:", profileError);
            throw new Error(`Profile fetch error: ${profileError.message}`);
        }

        if (!userProfile?.stripe_customer_id) {
            console.error("No stripe_customer_id found for user:", userId);
            throw new Error(`User ${userId} has no Stripe Customer ID associated`);
        }

        const customerId = userProfile.stripe_customer_id;
        console.log(`Found Stripe Customer ID: ${customerId}`);

        // 2. Find Active or Trialing Subscription
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: "all",
            limit: 10,
        });

        const currentSubscription = subscriptions.data.find((s: any) =>
            ["active", "trialing", "past_due"].includes(s.status)
        );

        if (!currentSubscription) {
            console.error(`No valid subscription found for customer ${customerId}. Statuses found:`, subscriptions.data.map(s => s.status));
            throw new Error(`No active or valid subscription found to update for customer ${customerId}`);
        }

        const currentItemId = currentSubscription.items.data[0].id;
        console.log(`Current Sub: ${currentSubscription.id}, Current Item: ${currentItemId}`);

        // 3. Get Prices to compare (for Upgrade vs Downgrade logic)
        const currentPriceId = currentSubscription.items.data[0].price.id;
        const currentPrice = await stripe.prices.retrieve(currentPriceId);
        const newPrice = await stripe.prices.retrieve(newPriceId);

        const currentAmount = currentPrice.unit_amount || 0;
        const newAmount = newPrice.unit_amount || 0;
        const isUpgrade = newAmount > currentAmount;

        console.log(`Priceline Change: ${currentAmount} -> ${newAmount} (Type: ${isUpgrade ? 'UPGRADE' : 'DOWNGRADE/SAME'})`);

        // 4. Preview Invoice
        let upcomingInvoice;
        try {
            upcomingInvoice = await stripe.invoices.retrieveUpcoming({
                customer: customerId,
                subscription: currentSubscription.id,
                subscription_items: [{
                    id: currentItemId,
                    price: newPriceId,
                }],
            });
        } catch (invoiceError: any) {
            console.error("Stripe retrieveUpcoming error:", invoiceError);
            throw new Error(`Stripe Preview Error: ${invoiceError.message}`);
        }

        const amountDue = upcomingInvoice.amount_due;
        console.log(`Amount Due on next invoice: ${amountDue}`);

        if (isUpgrade) {
            // UPGRADE: Usually requires immediate payment of difference
            console.log("Processing UPGRADE...");
            const updatedSubscription = await stripe.subscriptions.update(currentSubscription.id, {
                items: [{
                    id: currentItemId,
                    price: newPriceId,
                }],
                proration_behavior: 'always_invoice',
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent'],
            });

            // Cast latest_invoice to get access to payment_intent
            const latestInvoice = updatedSubscription.latest_invoice as any;
            const paymentIntent = latestInvoice?.payment_intent;

            if (paymentIntent && typeof paymentIntent === 'object' && paymentIntent.client_secret) {
                return new Response(JSON.stringify({
                    action: 'upgrade',
                    clientSecret: paymentIntent.client_secret,
                    amount: amountDue
                }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            } else {
                // No payment intent required (maybe price difference is 0 due to timing, or credit exists)
                await supabase.from("users").update({
                    subscription_type: newPlanName,
                    subscription_status: "active"
                }).eq("user_id", userId);

                return new Response(JSON.stringify({
                    action: 'upgrade_no_payment_needed',
                    amount: amountDue > 0 ? amountDue : 0
                }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }

        } else if (newAmount < currentAmount) {
            // DOWNGRADE: Subscription items update and possible refund
            console.log("Processing DOWNGRADE...");

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

            // If there's a negative amount due, it's a credit that we might want to refund
            let refundId = null;
            if (amountDue < 0) {
                const refundAmount = Math.abs(amountDue);
                const charges = await stripe.charges.list({ customer: customerId, limit: 1 });

                if (charges.data.length > 0) {
                    try {
                        const refund = await stripe.refunds.create({
                            charge: charges.data[0].id,
                            amount: refundAmount,
                            metadata: { reason: "Downgrade difference refund" }
                        });
                        refundId = refund.id;
                    } catch (e) {
                        console.error("Refund failed (user might still have credit):", e);
                    }
                }
            }

            await supabase.from("users").update({
                subscription_type: newPlanName,
                subscription_status: "active"
            }).eq("user_id", userId);

            return new Response(JSON.stringify({
                action: 'downgrade',
                refundId: refundId,
                message: refundId ? 'Plan updated and refund processed' : 'Plan updated'
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });

        } else {
            // SAME PRICE CHANGE
            console.log("Processing PLAN CHANGE (same price)...");
            await stripe.subscriptions.update(currentSubscription.id, {
                items: [{
                    id: currentItemId,
                    price: newPriceId,
                }],
                metadata: {
                    user_id: userId,
                    plan: newPlanName,
                    type: "plan_change"
                }
            });

            await supabase.from("users").update({
                subscription_type: newPlanName,
                subscription_status: "active"
            }).eq("user_id", userId);

            return new Response(JSON.stringify({
                action: 'no_charge',
                message: 'Subscription updated'
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

    } catch (error: any) {
        console.error("Error in change-subscription function:", error.message);
        return new Response(JSON.stringify({
            error: error.message,
            stack: error.stack // Optional: helps debug in the console
        }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
