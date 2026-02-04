
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const REBRICKABLE_API_KEY = "a52f6e7e9cb8c225d1339dcfda8b6ae7";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to normalize Age Range
const normalizeAgeRange = (min: number, max: number | null): string => {
    const targets = [4, 6, 9, 12, 18];

    // Calculate midpoint
    // If max exists, midpoint = (min + max) / 2
    // If only min (e.g. 16+), midpoint = min (or min + small delta, but min is fine as anchor)
    const mid = max ? (min + max) / 2 : min;

    // Find nearest neighbor
    let closest = targets[0];
    let minDiff = Math.abs(mid - closest);

    for (let i = 1; i < targets.length; i++) {
        const diff = Math.abs(mid - targets[i]);
        if (diff < minDiff) { // < prefers lower in tie, <= prefers higher. 
            // Standard: round to nearest. Ties: let's prefer higher as safe bet for difficulty?
            // Proposal said: "tie -> round up".
            // If diff == minDiff, we want the current 'target[i]' (which is higher)
            minDiff = diff;
            closest = targets[i];
        } else if (diff === minDiff) {
            // Tie (e.g. 7.5 between 6 and 9)
            // Check if target[i] > closest. Since array is sorted, it is.
            closest = targets[i];
        }
    }

    return `${closest}+`;
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        // Pricing Env Vars
        const PRICE_250 = parseInt(Deno.env.get('SET_PRICE_LESS_250') || '25');
        const PRICE_500 = parseInt(Deno.env.get('SET_PRICE_LESS_500') || '50');
        const PRICE_750 = parseInt(Deno.env.get('SET_PRICE_LESS_750') || '75');
        const PRICE_1000 = parseInt(Deno.env.get('SET_PRICE_LESS_1000') || '100');
        const PRICE_1500 = parseInt(Deno.env.get('SET_PRICE_MORE_1500') || '150');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase Environment Variables");
        }

        const supabaseClient = createClient(supabaseUrl, supabaseKey);

        let body;
        try { body = await req.json(); } catch { throw new Error("Invalid JSON"); }

        const { set_ref, action = 'import' } = body;

        if (!set_ref) throw new Error("Missing set_ref");

        const ref = set_ref.includes('-') ? set_ref : `${set_ref}-1`;
        console.log(`Processing set: ${ref}, Action: ${action}`);

        // 1. Fetch Set Info from Brickset (Primary Source)
        console.log(`Fetching metadata from Brickset for ${ref}...`);

        let bricksetId = 0;
        let setName = "Unknown";
        let themeName = "Unknown";
        let subthemeName = null;
        let pieceCount = 0;
        let minifigsCount = 0;
        let yearReleased = 0;
        let imageUrl = null;
        let pvpRelease = 0;
        let currentValueNew = 0;
        let currentValueUsed = 0;
        let barcodeUPC = null;
        let barcodeEAN = null;
        let setWeight = 0;
        let ageRange = "N/A";
        let extendedDescription: string | null = null;

        const BRICKSET_API_KEY = Deno.env.get('BRICKSET_API_KEY');
        if (!BRICKSET_API_KEY) throw new Error("Missing Brickset API Key");

        try {
            const bricksetUrl = `https://brickset.com/api/v3.asmx/getSets?apiKey=${BRICKSET_API_KEY}&userHash=&params=${JSON.stringify({ setNumber: ref })}`;
            const bsRes = await fetch(bricksetUrl);

            if (!bsRes.ok) throw new Error("Brickset API Fetch Failed");
            const bsData = await bsRes.json();

            if (!bsData.sets || bsData.sets.length === 0) {
                console.warn(`Set ${ref} not found in Brickset.`);
                throw new Error(`Set ${ref} not found in Brickset.`);
            }

            const bsSet = bsData.sets[0];

            // Map Brickset Data
            bricksetId = bsSet.setID;
            setName = bsSet.name;
            yearReleased = bsSet.year;
            pieceCount = bsSet.pieces || 0;
            minifigsCount = bsSet.minifigs || 0;
            themeName = bsSet.theme || "Unknown";
            subthemeName = bsSet.subtheme || null;

            // Images
            if (bsSet.image) {
                imageUrl = bsSet.image.imageURL;
                if (bsSet.image.largeURL) imageUrl = bsSet.image.largeURL;
            }

            // Barcodes
            if (bsSet.barcode) {
                barcodeEAN = bsSet.barcode.EAN || null;
                barcodeUPC = bsSet.barcode.UPC || null;
            }

            // Prices / Values
            // RRP (Retail Price)
            if (bsSet.LEGOCom) {
                if (bsSet.LEGOCom.DE && bsSet.LEGOCom.DE.retailPrice) {
                    pvpRelease = bsSet.LEGOCom.DE.retailPrice; // Use German price as EU proxy
                } else if (bsSet.LEGOCom.UK && bsSet.LEGOCom.UK.retailPrice) {
                    pvpRelease = bsSet.LEGOCom.UK.retailPrice;
                } else if (bsSet.LEGOCom.US && bsSet.LEGOCom.US.retailPrice) {
                    pvpRelease = bsSet.LEGOCom.US.retailPrice;
                }
            }

            // Current Value (Not consistently returned by API v3 basic call, usually empty)
            if (bsSet.value) {
                currentValueNew = bsSet.value.new || 0;
                currentValueUsed = bsSet.value.used || 0;
            }

            // Age Range
            if (bsSet.ageRange) {
                const min = bsSet.ageRange.min || 0;
                const max = bsSet.ageRange.max || null;
                if (min) {
                    ageRange = normalizeAgeRange(min, max);
                }
            }

            // Extended Data (Description/Notes)
            if (bsSet.extendedData) {
                extendedDescription = bsSet.extendedData.description || bsSet.extendedData.notes || null;
            }

            console.log(`Brickset Meta: ${setName} (${yearReleased}), Theme: ${themeName}/${subthemeName}, Pieces: ${pieceCount}`);

        } catch (e) {
            console.error("Brickset fetch error:", e);
            throw e;
        }

        const numParts = pieceCount; // Alias for pricing logic compatibility

        // Calculate Price
        let calculatedPrice = 125; // Default for 1000-1500 or fallback
        if (numParts < 250) calculatedPrice = PRICE_250;
        else if (numParts < 500) calculatedPrice = PRICE_500;
        else if (numParts < 750) calculatedPrice = PRICE_750;
        else if (numParts < 1000) calculatedPrice = PRICE_1000;
        else if (numParts >= 1500) calculatedPrice = PRICE_1500;

        // Prepare Preview Data
        const previewData = {
            set_ref: ref,
            set_name: setName,
            set_theme: themeName,
            set_piece_count: pieceCount,
            year_released: yearReleased,
            set_image_url: imageUrl,
            set_price: calculatedPrice,
            set_minifigs: minifigsCount,
            set_weight: setWeight,
            current_value_new: currentValueNew,
            current_value_used: currentValueUsed,
            set_pvp_release: pvpRelease,
            set_subtheme: subthemeName,
            barcode_upc: barcodeUPC,
            barcode_ean: barcodeEAN,
            set_age_range: ageRange,
            set_description: extendedDescription // Add description to preview
        };

        if (action === 'preview') {
            return new Response(
                JSON.stringify({
                    success: true,
                    data: previewData,
                    message: "Preview data fetched successfully"
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // --- IMPORT ACTIONS ---

        const { data: existingSet } = await supabaseClient.from('sets').select('id').eq('set_ref', ref).maybeSingle();
        let setId;

        if (action === 'import') {
            // 3. Upsert Set
            console.log("Upserting set to DB...");
            const setPayload = {
                ...previewData,
                set_description: extendedDescription || `Imported from Brickset. Theme: ${themeName}`,
                catalogue_visibility: true,
                set_status: 'active'
            };

            if (existingSet) {
                const { error: updateError } = await supabaseClient.from('sets').update(setPayload).eq('id', existingSet.id);
                if (updateError) throw updateError;
                setId = existingSet.id;
            } else {
                const { data: newSet, error: insertError } = await supabaseClient.from('sets').insert(setPayload).select().single();
                if (insertError) throw insertError;
                setId = newSet.id;
            }
        } else if (action === 'import_pieces') {
            // Just get the ID
            if (!existingSet) {
                throw new Error(`Set ${ref} does not exist in database. Import the set first.`);
            }
            setId = existingSet.id;
            console.log(`Importing pieces for existing set ID: ${setId}`);
        } else {
            throw new Error(`Invalid action: ${action}`);
        }

        // --- UPDATE INVENTORY (User Request: total + 1, en_uso + 1) ---
        if (action === 'import') { // Only on import, not import_pieces (unless requested)
            console.log("Updating Inventory...");
            const { data: inventory } = await supabaseClient
                .from('inventory_sets')
                .select('id, inventory_set_total_qty, en_uso')
                .eq('set_id', setId)
                .maybeSingle();

            if (inventory) {
                // Increment
                const newQty = (inventory.inventory_set_total_qty || 0) + 1;
                const newEnUso = (inventory.en_uso || 0) + 1;
                await supabaseClient
                    .from('inventory_sets')
                    .update({
                        inventory_set_total_qty: newQty,
                        en_uso: newEnUso,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', inventory.id);
                console.log(`Inventory updated: Qty=${newQty}, EnUso=${newEnUso}`);
            } else {
                // Insert new
                await supabaseClient
                    .from('inventory_sets')
                    .insert({
                        set_id: setId,
                        set_ref: ref,
                        inventory_set_total_qty: 1,
                        en_uso: 1,
                        // Defaults as 0 for others
                    });
                console.log("Inventory record created.");
            }
        }

        // 4. Fetch & Insert Inventory
        console.log("Fetching full inventory...");
        let invUrl = `https://rebrickable.com/api/v3/lego/sets/${ref}/parts/?page_size=1000&inc_part_details=1`; // Max page size
        const allPieces = [];

        while (invUrl) {
            const invRes = await fetch(invUrl, { headers: { 'Authorization': `key ${REBRICKABLE_API_KEY}` } });
            if (!invRes.ok) break;
            const invData = await invRes.json();
            allPieces.push(...invData.results);
            invUrl = invData.next;
        }

        await supabaseClient.from('set_piece_list').delete().eq('set_id', setId);

        const piecesPayload = allPieces.map(p => ({
            set_id: setId,
            set_ref: ref,
            piece_ref: p.part.part_num,
            color_ref: p.color ? p.color.name : 'Unknown',
            piece_description: p.part.name,
            piece_qty: p.quantity,
            piece_image_url: p.part.part_img_url,
            piece_weight: 0,
            element_id: p.element_id || null,
            color_id: p.color ? p.color.id : null,
            is_spare: p.is_spare || false,
            part_cat_id: p.part.part_cat_id || null,
            year_from: p.part.year_from || null,
            year_to: p.part.year_to || null,
            is_trans: p.color ? p.color.is_trans : false,
            external_ids: p.part.external_ids || null
        }));

        if (piecesPayload.length > 0) {
            console.log("Sample Piece Payload:", JSON.stringify(piecesPayload[0], null, 2));
        }

        // Chunked Insert
        const chunkSize = 100;
        for (let i = 0; i < piecesPayload.length; i += chunkSize) {
            const chunk = piecesPayload.slice(i, i + chunkSize);
            const { error: piecesError } = await supabaseClient.from('set_piece_list').insert(chunk);
            if (piecesError) console.error("Chunk insert error", piecesError);
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Imported ${ref}: ${previewData.set_name} with ${allPieces.length} pieces.`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error("Handler Error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: (error as Error).message || "Unknown error"
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});
