import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return new Response("No signature", { status: 400 });
    }

    try {
        const body = await req.text();
        const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

        let event;
        if (endpointSecret) {
            event = await stripe.webhooks.constructEventAsync(
                body,
                signature,
                endpointSecret,
                undefined,
                cryptoProvider
            );
        } else {
            event = JSON.parse(body);
        }

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        console.log(`Handling Stripe event: ${event.type}`);

        switch (event.type) {
            case "invoice.paid": {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;
                const customerId = invoice.customer;

                // Try to get plan from subscription metadata or items
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const plan = subscription.metadata.plan;
                const userId = subscription.metadata.user_id;

                console.log(`Invoice paid for customer ${customerId}. Plan from metadata: ${plan}. UserID: ${userId}`);

                if (customerId) {
                    const updateData: any = {
                        subscription_status: "active",
                        subscription_id: subscriptionId
                    };

                    // Only update subscription_type if we have it in metadata
                    // This prevents overwriting a correct value with a fallback if metadata isn't ready
                    if (plan) {
                        updateData.subscription_type = plan;
                    }

                    const { error } = await supabase
                        .from("users")
                        .update(updateData)
                        .eq("stripe_customer_id", customerId);

                    if (error) {
                        console.error(`Database update error for customer ${customerId}:`, error);
                        throw error;
                    }
                }
                break;
            }

            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                const userId = paymentIntent.metadata.user_id;
                const orderType = paymentIntent.metadata.order_type;

                console.log(`Payment successful for user ${userId}, type ${orderType}`);

                if (orderType === "shipment") {
                    // Logic for extra shipping payments
                    // e.g., update the shipment status or create a record
                    console.log("Processing shipment payment logic...");
                    // Placeholder for future logic
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                const customerId = subscription.customer;

                console.log(`Subscription deleted for customer ${customerId}`);

                if (customerId) {
                    const { error } = await supabase
                        .from("users")
                        .update({ subscription_status: "canceled" })
                        .eq("stripe_customer_id", customerId);

                    if (error) throw error;
                }
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
});
