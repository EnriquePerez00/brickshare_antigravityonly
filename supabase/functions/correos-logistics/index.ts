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
    scope: string;
}

const OFFICE_ADDRESS = {
    nombre: "Brickshare Oficinas",
    direccion: "Avinguda josep Tarradellas 97, 5",
    cp: "08029",
    poblacion: "Barcelona",
    provincia: "Barcelona",
    pais: "España"
};

// Simple in-memory cache for the token
let cachedToken: string | null = null;
let tokenExpiration: number | null = null;

const getCorreosToken = async (config: CorreosConfig): Promise<string> => {
    if (cachedToken && tokenExpiration && Date.now() < tokenExpiration - 60000) {
        return cachedToken;
    }

    console.log("Acquiring new Correos token...");

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', config.clientId);
    params.append('client_secret', config.clientSecret);
    params.append('scope', config.scope);

    const response = await fetch(config.authUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
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
    const expiresInMinutes = data.expiresIn ? parseInt(data.expiresIn) : 30;
    tokenExpiration = Date.now() + (expiresInMinutes * 60 * 1000);

    return data.access_token;
};

const fetchWithAuth = async (url: string, options: RequestInit, config: CorreosConfig): Promise<Response> => {
    let token = await getCorreosToken(config);

    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.status === 401 || response.status === 403) {
        console.warn(`Received ${response.status}, refreshing token and retrying...`);
        cachedToken = null;
        tokenExpiration = null;
        token = await getCorreosToken(config);

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

const sendReturnEmail = async (supabaseUrl: string, supabaseKey: string, emailData: any) => {
    try {
        const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify(emailData)
        });
        return response.ok;
    } catch (e) {
        console.error("Failed to send return email:", e);
        return false;
    }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabaseClient = createClient(supabaseUrl, supabaseKey)

        const config: CorreosConfig = {
            clientId: Deno.env.get('CORREOS_CLIENT_ID') ?? '',
            clientSecret: Deno.env.get('CORREOS_CLIENT_SECRET') ?? '',
            contractId: Deno.env.get('CORREOS_CONTRACT_ID') ?? '',
            baseUrl: Deno.env.get('CORREOS_BASE_URL') ?? Deno.env.get('CORREOS_BASE_PRE_PROD_URL') ?? 'https://api1.correos.es',
            authUrl: Deno.env.get('CORREOS_AUTH_URL') ?? 'https://apioauthcid.correos.es/Api/Authorize/Token',
            scope: Deno.env.get('CORREOS_SCOPE') ?? 'oauthtest'
        }

        const { action, p_envios_id } = await req.json()

        // 1. JWT Verification and Authorization
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Missing Authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const supabaseUserClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
            global: { headers: { Authorization: authHeader } }
        })

        const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser()
        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 2. Role check (Only admins and operadores)
        const { data: roles, error: rolesError } = await supabaseClient
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)

        if (rolesError) throw rolesError

        const userRoles = roles.map(r => r.role)
        const isAuthorized = userRoles.includes('admin') || userRoles.includes('operador')

        if (!isAuthorized) {
            return new Response(
                JSON.stringify({ error: 'Forbidden - Insufficient permissions' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (!action || !p_envios_id) {
            return new Response(
                JSON.stringify({ error: 'Missing action or p_envios_id' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        switch (action) {
            case 'preregister': {
                const { data: envio, error: envioError } = await supabaseClient
                    .from('envios')
                    .select('*, profiles(full_name, email, phone)')
                    .eq('id', p_envios_id)
                    .single();

                if (envioError || !envio) {
                    throw new Error(`Shipment not found: ${envioError?.message}`);
                }

                const preregisterPayload = {
                    solicitante: config.contractId,
                    fecha: new Date().toISOString().split('T')[0],
                    envio: {
                        codEtiquetado: "",
                        referencia: envio.id,
                        remitente: {
                            nombre: "Brickshare Almacén",
                            direccion: OFFICE_ADDRESS.direccion,
                            cp: OFFICE_ADDRESS.cp,
                            poblacion: OFFICE_ADDRESS.poblacion,
                            provincia: OFFICE_ADDRESS.provincia,
                        },
                        destinatario: {
                            nombre: envio.profiles?.full_name || "Cliente Brickshare",
                            direccion: envio.direccion_envio,
                            cp: envio.codigo_postal_envio,
                            poblacion: envio.ciudad_envio,
                            provincia: envio.ciudad_envio,
                            email: envio.profiles?.email,
                            telefono: envio.profiles?.phone,
                        },
                        bultos: [{
                            peso: 1,
                            alto: 10,
                            ancho: 20,
                            largo: 30,
                        }]
                    }
                };

                const preregisterResponse = await fetchWithAuth(`${config.baseUrl}/preregister`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(preregisterPayload),
                }, config);

                if (!preregisterResponse.ok) {
                    const errorData = await preregisterResponse.json();
                    throw new Error(`Correos Preregister Error: ${JSON.stringify(errorData)}`);
                }

                const preregisterData = await preregisterResponse.json();
                const correosShipmentId = preregisterData.codEtiquetado;

                await supabaseClient
                    .from('envios')
                    .update({
                        correos_shipment_id: correosShipmentId,
                        estado_envio: 'asignado',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', p_envios_id);

                return new Response(
                    JSON.stringify({ message: 'Preregistration successful', correos_shipment_id: correosShipmentId }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            case 'return_preregister': {
                // 1. Fetch shipment and user data
                const { data: envio, error: envioError } = await supabaseClient
                    .from('envios')
                    .select('*, profiles(full_name, email, phone)')
                    .eq('id', p_envios_id)
                    .single();

                if (envioError || !envio) {
                    throw new Error(`Shipment info not found: ${envioError?.message}`);
                }

                // 2. Fetch PUDO info for this user
                const { data: pudoData, error: pudoError } = await supabaseClient
                    .from('users_correos_dropping')
                    .select('*')
                    .eq('user_id', envio.user_id)
                    .single();

                if (pudoError) {
                    console.warn(`PUDO info not found for user ${envio.user_id}: ${pudoError.message}`);
                }

                const pudo = pudoData;

                const returnPayload = {
                    solicitante: config.contractId,
                    fecha: new Date().toISOString().split('T')[0],
                    envio: {
                        referencia: `RET-${envio.id.substring(0, 8)}`,
                        remitente: {
                            nombre: envio.profiles?.full_name || "Cliente Brickshare",
                            direccion: pudo?.correos_direccion_completa || envio.direccion_envio,
                            cp: pudo?.correos_codigo_postal || envio.codigo_postal_envio,
                            poblacion: pudo?.correos_ciudad || envio.ciudad_envio,
                            provincia: pudo?.correos_provincia || envio.ciudad_envio,
                            email: envio.profiles?.email,
                            telefono: envio.profiles?.phone,
                        },
                        destinatario: {
                            nombre: OFFICE_ADDRESS.nombre,
                            direccion: OFFICE_ADDRESS.direccion,
                            cp: OFFICE_ADDRESS.cp,
                            poblacion: OFFICE_ADDRESS.poblacion,
                            provincia: OFFICE_ADDRESS.provincia,
                        },
                        bultos: [{
                            peso: 1,
                            alto: 10,
                            ancho: 20,
                            largo: 30,
                        }],
                        caracteristicas: {
                            etiqueta_sin_etiqueta: "S"
                        }
                    }
                };

                const returnResponse = await fetchWithAuth(`${config.baseUrl}/preregister`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(returnPayload),
                }, config);

                if (!returnResponse.ok) {
                    const errorData = await returnResponse.json();
                    throw new Error(`Correos Return Preregister Error: ${JSON.stringify(errorData)}`);
                }

                const returnData = await returnResponse.json();
                const returnCode = returnData.codEtiquetado;

                await supabaseClient
                    .from('envios')
                    .update({
                        numero_seguimiento: returnCode,
                        estado_envio: 'ruta_devolucion',
                        fecha_solicitud_devolucion: new Date().toISOString(),
                        proveedor_recogida: 'Correos (Sin Etiqueta)',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', p_envios_id);

                await sendReturnEmail(supabaseUrl, supabaseKey, {
                    to: envio.profiles?.email,
                    subject: "Tu código de devolución Brickshare",
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                            <h2>¡Hola ${envio.profiles?.full_name}!</h2>
                            <p>Has solicitado la devolución de tu set de LEGO. Hemos activado el servicio <strong>"Etiqueta sin Etiqueta"</strong> para tu comodidad.</p>
                            <div style="background: #fdf6b2; padding: 20px; border-radius: 12px; border: 1px solid #facc15; text-align: center; margin: 20px 0;">
                                <p style="margin: 0; font-size: 14px; color: #854d0e;">CÓDIGO DE DEVOLUCIÓN</p>
                                <h1 style="margin: 10px 0; font-size: 32px; letter-spacing: 2px;">${returnCode}</h1>
                            </div>
                            <p><strong>Pasos a seguir:</strong></p>
                            <ol>
                                <li>Prepara el paquete de forma segura.</li>
                                <li>Llévalo a tu oficina de Correos seleccionada: <strong>${pudo?.correos_nombre || 'Oficina de Correos'}</strong>.</li>
                                <li>Muestra este código al personal de Correos. <strong>No necesitas imprimir nada.</strong></li>
                            </ol>
                            <p>Gracias por jugar con Brickshare.</p>
                        </div>
                    `
                });

                return new Response(
                    JSON.stringify({ message: 'Return requested successfully', return_code: returnCode }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            case 'get_label': {
                const { data: envio, error: envioError } = await supabaseClient
                    .from('envios')
                    .select('correos_shipment_id')
                    .eq('id', p_envios_id)
                    .single();

                if (envioError || !envio?.correos_shipment_id) {
                    throw new Error(`Shipment or Correos ID not found: ${envioError?.message}`);
                }

                const labelResponse = await fetchWithAuth(`${config.baseUrl}/labels`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        shipmentId: envio.correos_shipment_id,
                        format: 'PDF',
                    }),
                }, config);

                if (!labelResponse.ok) throw new Error(`Correos Label Error: ${labelResponse.statusText}`);

                const labelBlob = await labelResponse.blob();
                const fileName = `label_${envio.correos_shipment_id}.pdf`;
                const filePath = `${p_envios_id}/${fileName}`;

                await supabaseClient.storage.from('shipping-labels').upload(filePath, labelBlob, {
                    contentType: 'application/pdf',
                    upsert: true
                });

                const { data: { publicUrl } } = supabaseClient.storage.from('shipping-labels').getPublicUrl(filePath);

                await supabaseClient.from('envios').update({
                    label_url: publicUrl,
                    updated_at: new Date().toISOString()
                }).eq('id', p_envios_id);

                return new Response(
                    JSON.stringify({ message: 'Label generated successfully', label_url: publicUrl }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            case 'request_pickup': {
                const { data: envio, error: envioError } = await supabaseClient
                    .from('envios')
                    .select('*, profiles(full_name, email, phone)')
                    .eq('id', p_envios_id)
                    .single();

                if (envioError || !envio) throw new Error(`Shipment not found: ${envioError?.message}`);

                const pickupPayload = [{
                    codContract: config.contractId,
                    codSpecificContract: config.contractId,
                    codAnnex: '091',
                    modalityType: 'S',
                    estimatedShipments: 1,
                    estimatedVolume: 20,
                    address: envio.direccion_envio.split(',')[0].trim(),
                    number: '1',
                    locality: envio.ciudad_envio,
                    province: envio.ciudad_envio,
                    postalCode: envio.codigo_postal_envio,
                    contactName: envio.profiles?.full_name || "Cliente Brickshare",
                    contactEmail: envio.profiles?.email || "info@brickshare.es",
                    phoneNumberContact: envio.profiles?.phone || "000000000",
                    originSystem: 'CEX'
                }];

                const pickupResponse = await fetchWithAuth(`${config.baseUrl}/digital-delivery/v1/pickups`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pickupPayload),
                }, config);

                if (!pickupResponse.ok) {
                    const errorData = await pickupResponse.json();
                    throw new Error(`Correos Pickup Error: ${JSON.stringify(errorData)}`);
                }

                const pickupData = await pickupResponse.json();
                const pickupId = pickupData[0]?.codRequests;

                await supabaseClient.from('envios').update({
                    pickup_id: pickupId,
                    updated_at: new Date().toISOString()
                }).eq('id', p_envios_id);

                return new Response(
                    JSON.stringify({ message: 'Pickup requested successfully', pickup_id: pickupId }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            case 'track': {
                const { data: envio, error: envioError } = await supabaseClient
                    .from('envios')
                    .select('correos_shipment_id')
                    .eq('id', p_envios_id)
                    .single();

                if (envioError || !envio?.correos_shipment_id) {
                    throw new Error(`Shipment or Correos ID not found: ${envioError?.message}`);
                }

                const trackResponse = await fetchWithAuth(`${config.baseUrl}/logistics/trackpub/api/v2/search/${envio.correos_shipment_id}`, {
                    method: 'GET',
                    headers: {
                        'client_id': config.clientId,
                        'client_secret': config.clientSecret,
                    },
                }, config);

                if (!trackResponse.ok) throw new Error(`Correos Tracking Error: ${trackResponse.statusText}`);

                const trackData = await trackResponse.json();

                await supabaseClient.from('envios').update({
                    last_tracking_update: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }).eq('id', p_envios_id);

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
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

