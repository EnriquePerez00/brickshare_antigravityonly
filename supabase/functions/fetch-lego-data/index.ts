import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const REBRICKABLE_API_KEY = Deno.env.get("REBRICKABLE_API_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { set_number } = await req.json();

        if (!set_number) {
            return new Response(JSON.stringify({ error: "set_number is required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (!REBRICKABLE_API_KEY) {
            return new Response(JSON.stringify({ error: "REBRICKABLE_API_KEY not configured" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Try with -1 suffix first as it's the standard for LEGO sets
        const url = `https://rebrickable.com/api/v3/lego/sets/${set_number}-1/`;
        console.log(`Fetching from: ${url}`);

        const response = await fetch(url, {
            headers: {
                Authorization: `key ${REBRICKABLE_API_KEY}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return new Response(JSON.stringify({ error: "Failed to fetch from Rebrickable", details: errorData }), {
                status: response.status,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const data = await response.json();

        // Transform to our internal structure
        const enrichedData = {
            name: data.name,
            piece_count: data.num_parts,
            year_released: data.year,
            image_url: data.set_img_url,
            theme_id: data.theme_id,
            // Rebrickable doesn't directly provide weight in this endpoint, 
            // but it's a great start
        };

        return new Response(JSON.stringify(enrichedData), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
