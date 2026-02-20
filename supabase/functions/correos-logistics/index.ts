import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CorreosConfig {
    clientId: string;
    clientSecret: string;
    contractId: string;
    baseUrl: string;
    authUrl: string;
    scope: string; // Added scope
}

// Simple in-memory cache for the token (variables persist in hot instances of Edge Functions)
let cachedToken: string | null = null;
let tokenExpiration: number | null = null;

const getCorreosToken = async (config: CorreosConfig): Promise<string> => {
    // Return cached token if valid (providing a buffer, e.g., 60 seconds)
    if (cachedToken && tokenExpiration && Date.now() < tokenExpiration - 60000) {
        return cachedToken;
    }

    console.log("Acquiring new Correos token...");

    // The documentation has conflicting info (Form vs JSON). 
    // Standard OAuth client_credentials usually requires:
    // 1. Authorization: Basic <base64(client_id:client_secret)>
    // 2. Content-Type: application/x-www-form-urlencoded
    // 3. Body: grant_type=client_credentials&scope=...

    // However, the text says "Request Body (formato JSON)".
    // We will try the standard form-urlencoded approach first as it matches the "Header" table in the docs.

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials'); // Fixed text
    params.append('client_id', config.clientId);       // "obtenido en el proceso de registro"
    params.append('client_secret', config.clientSecret); // "obtenido en el proceso de registro"
    params.append('scope', config.scope);

    // Encode credentials for Basic Auth header
    const credentials = btoa(`${config.clientId}:${config.clientSecret}`);

    const response = await fetch(config.authUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json', // We expect JSON back
            // The docs table says "Authorization" header is for invoking APIs, 
            // but standard OAuth often uses it for the token endpoint too. 
            // The docs *don't* explicitly say to use Basic Auth in the *table* for Token, 
            // but strictly following standard OAuth 2.0 (RFC 6749), typically one is enough.
            // Given the body contains client_id and secret, Basic Auth might be redundant or conflicting, 
            // BUT many implementations allow both or require one. 
            // The provided code snippet used it. Let's keep it if it was there, or stick to body if that's what the docs emphasize.
            // Re-reading docs: "client_id: obtenido...", "client_secret: obtenido...". 
            // These act as the credentials.
            // Let's try WITHOUT Basic Auth first if the body has them, to strictly follow the "ENTRADA" table.
            // Wait, the previous code had Basic Auth. I will stick to the "ENTRADA" table which lists client_id/secret in the BODY.
        },
        body: params,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to get OAuth token: ${response.status} ${response.statusText} - ${text}`);
    }

    const data = await response.json();

    if (!data.access_token) {
        throw new Error(`Token response missing access_token: ${JSON.stringify(data)}`);
    }

    cachedToken = data.access_token;
    // expiresIn is in minutes ("30"), convert to ms
    const expiresInMinutes = data.expiresIn ? parseInt(data.expiresIn) : 30;
    tokenExpiration = Date.now() + (expiresInMinutes * 60 * 1000);

    return data.access_token;
};

// Helper to handle 401 retries
const fetchWithAuth = async (url: string, options: RequestInit, config: CorreosConfig): Promise<Response> => {
    let token = await getCorreosToken(config);

    // First attempt
    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    });

    // Retry logic: if 401 or 403, invalidate token and retry once
    if (response.status === 401 || response.status === 403) {
        console.warn(`Received ${response.status}, refreshing token and retrying...`);
        cachedToken = null; // Invalidate cache
        tokenExpiration = null;

        token = await getCorreosToken(config); // Fetch new token

        response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            }
        });
    }

    return response;
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const config: CorreosConfig = {
            clientId: Deno.env.get('CORREOS_CLIENT_ID') ?? '',
            clientSecret: Deno.env.get('CORREOS_CLIENT_SECRET') ?? '',
            contractId: Deno.env.get('CORREOS_CONTRACT_ID') ?? '',
            baseUrl: Deno.env.get('CORREOS_BASE_URL') ?? Deno.env.get('CORREOS_BASE_PRE_PROD_URL') ?? 'https://api1.correos.es',
            // Default to the doc-specified URL. 
            // Note: The doc says https://apioauthcid.correos.es/Api/Authorize/Token
            // Previous code had /token. I will use the one from the docs.
            authUrl: Deno.env.get('CORREOS_AUTH_URL') ?? 'https://apioauthcid.correos.es/Api/Authorize/Token',
            scope: Deno.env.get('CORREOS_SCOPE') ?? 'oauthtest' // Default fallback
        }

        const { action, p_envios_id } = await req.json()

        if (!action || !p_envios_id) {
            return new Response(
                JSON.stringify({ error: 'Missing action or p_envios_id' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // const accessToken = await getCorreosToken(config); // Handled by fetchWithAuth now

        // Placeholder for different actions (preregister, label, pickup, track)
        switch (action) {
            case 'preregister': {
                // 1. Fetch shipment and user data
                const { data: envio, error: envioError } = await supabaseClient
                    .from('envios')
                    .select('*, profiles(full_name, email, phone)')
                    .eq('id', p_envios_id)
                    .single();

                if (envioError || !envio) {
                    throw new Error(`Shipment not found: ${envioError?.message}`);
                }

                // 2. Prepare payload for Correos Preregister API
                // This is a simplified schema based on typical Correos REST API requirements
                const preregisterPayload = {
                    solicitante: config.contractId,
                    fecha: new Date().toISOString().split('T')[0],
                    envio: {
                        codEtiquetado: "", // To be returned by API
                        referencia: envio.id,
                        remitente: {
                            nombre: "Brickshare Almacén",
                            direccion: "Calle Falsa 123", // Should come from config/vault
                            cp: "28001",
                            poblacion: "Madrid",
                            provincia: "Madrid",
                        },
                        destinatario: {
                            nombre: envio.profiles?.full_name || "Cliente Brickshare",
                            direccion: envio.direccion_envio,
                            cp: envio.codigo_postal_envio,
                            poblacion: envio.ciudad_envio,
                            provincia: envio.ciudad_envio, // Simple mapping for now
                            email: envio.profiles?.email,
                            telefono: envio.profiles?.phone,
                        },
                        bultos: [{
                            peso: 1, // Default or from set info
                            alto: 10,
                            ancho: 20,
                            largo: 30,
                        }]
                    }
                };

                // 3. Call Correos Preregister API
                const preregisterResponse = await fetchWithAuth(`${config.baseUrl}/preregister`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(preregisterPayload),
                }, config);

                if (!preregisterResponse.ok) {
                    const errorData = await preregisterResponse.json();
                    throw new Error(`Correos Preregister Error: ${JSON.stringify(errorData)}`);
                }

                const preregisterData = await preregisterResponse.json();
                const correosShipmentId = preregisterData.codEtiquetado;

                // 4. Update database with Correos ID
                const { error: updateError } = await supabaseClient
                    .from('envios')
                    .update({
                        correos_shipment_id: correosShipmentId,
                        estado_envio: 'asignado',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', p_envios_id);

                if (updateError) throw updateError;

                return new Response(
                    JSON.stringify({ message: 'Preregistration successful', correos_shipment_id: correosShipmentId }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
            case 'get_label': {
                // 1. Fetch shipment data
                const { data: envio, error: envioError } = await supabaseClient
                    .from('envios')
                    .select('correos_shipment_id')
                    .eq('id', p_envios_id)
                    .single();

                if (envioError || !envio?.correos_shipment_id) {
                    throw new Error(`Shipment or Correos ID not found: ${envioError?.message}`);
                }

                // 2. Call Correos Label API
                const labelResponse = await fetchWithAuth(`${config.baseUrl}/labels`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        shipmentId: envio.correos_shipment_id,
                        format: 'PDF', // Or ZPL
                    }),
                }, config);

                if (!labelResponse.ok) {
                    throw new Error(`Correos Label Error: ${labelResponse.statusText}`);
                }

                const labelBlob = await labelResponse.blob();
                const fileName = `label_${envio.correos_shipment_id}.pdf`;
                const filePath = `${p_envios_id}/${fileName}`;

                // 3. Upload to Supabase Storage
                const { data: storageData, error: storageError } = await supabaseClient
                    .storage
                    .from('shipping-labels')
                    .upload(filePath, labelBlob, {
                        contentType: 'application/pdf',
                        upsert: true
                    });

                if (storageError) throw storageError;

                // 4. Get public URL and update database
                const { data: { publicUrl } } = supabaseClient
                    .storage
                    .from('shipping-labels')
                    .getPublicUrl(filePath);

                const { error: updateError } = await supabaseClient
                    .from('envios')
                    .update({
                        label_url: publicUrl,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', p_envios_id);

                if (updateError) throw updateError;

                return new Response(
                    JSON.stringify({ message: 'Label generated successfully', label_url: publicUrl }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
            case 'request_pickup': {
                // 1. Fetch shipment and user data
                const { data: envio, error: envioError } = await supabaseClient
                    .from('envios')
                    .select('*, profiles(full_name, email, phone)')
                    .eq('id', p_envios_id)
                    .single();

                if (envioError || !envio) {
                    throw new Error(`Shipment not found: ${envioError?.message}`);
                }

                // 2. Prepare payload for Correos Pickup API (SolicitudRecogidaDTO)
                // Based on docs/api-specs/correos/requests/requests.yaml
                const pickupPayload = [{
                    codContract: config.contractId,
                    codSpecificContract: config.contractId,
                    codAnnex: '091', // Packages
                    modalityType: 'S', // Standard
                    estimatedShipments: 1,
                    estimatedVolume: 20, // Small
                    address: envio.direccion_envio.split(',')[0].trim(),
                    number: '1', // Placeholder if not parsed
                    locality: envio.ciudad_envio,
                    province: envio.ciudad_envio,
                    postalCode: envio.codigo_postal_envio,
                    contactName: envio.profiles?.full_name || "Cliente Brickshare",
                    contactEmail: envio.profiles?.email || "info@brickshare.es",
                    phoneNumberContact: envio.profiles?.phone || "000000000",
                    originSystem: 'CEX'
                }];

                // Endpoint changed to /digital-delivery/v1/pickups as per new instructions
                // Or fallback to requests API if that is legacy. User mentioned /digital-delivery/v1/pickups
                const pickupResponse = await fetchWithAuth(`${config.baseUrl}/digital-delivery/v1/pickups`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(pickupPayload),
                }, config);

                if (!pickupResponse.ok) {
                    const errorData = await pickupResponse.json();
                    throw new Error(`Correos Pickup Error: ${JSON.stringify(errorData)}`);
                }

                const pickupData = await pickupResponse.json();
                const pickupId = pickupData[0]?.codRequests;

                // 3. Update database with Pickup ID
                const { error: updateError } = await supabaseClient
                    .from('envios')
                    .update({
                        pickup_id: pickupId,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', p_envios_id);

                if (updateError) throw updateError;

                return new Response(
                    JSON.stringify({ message: 'Pickup requested successfully', pickup_id: pickupId }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
            case 'track': {
                // 1. Fetch shipment data
                const { data: envio, error: envioError } = await supabaseClient
                    .from('envios')
                    .select('correos_shipment_id')
                    .eq('id', p_envios_id)
                    .single();

                if (envioError || !envio?.correos_shipment_id) {
                    throw new Error(`Shipment or Correos ID not found: ${envioError?.message}`);
                }

                // 2. Call Correos Tracking API (trackpub)
                // Based on docs/api-specs/correos/trackpub/trackpub.yaml
                const trackResponse = await fetchWithAuth(`${config.baseUrl}/logistics/trackpub/api/v2/search/${envio.correos_shipment_id}`, {
                    method: 'GET',
                    headers: {
                        'client_id': config.clientId,
                        'client_secret': config.clientSecret,
                    },
                }, config);

                if (!trackResponse.ok) {
                    throw new Error(`Correos Tracking Error: ${trackResponse.statusText}`);
                }

                const trackData = await trackResponse.json();

                // 3. Update last tracking update in database
                const { error: updateError } = await supabaseClient
                    .from('envios')
                    .update({
                        last_tracking_update: new Date().toISOString(),
                        // We could also update the status if we map Correos events to our 'estado_envio'
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', p_envios_id);

                if (updateError) throw updateError;

                return new Response(
                    JSON.stringify({ message: 'Tracking info retrieved', data: trackData }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
            default:
                return new Response(
                    JSON.stringify({ error: 'Invalid action' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
        }

        return new Response(
            JSON.stringify({ message: 'Success' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
