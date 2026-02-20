import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CorreosConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  authUrl: string;
  scope: string;
}

// Simple in-memory cache for the token (variables persist in hot instances of Edge Functions)
let cachedToken: string | null = null;
let tokenExpiration: number | null = null;

const getCorreosToken = async (config: CorreosConfig): Promise<string> => {
  // Return cached token if valid (providing a buffer, e.g., 60 seconds)
  if (cachedToken && tokenExpiration && Date.now() < tokenExpiration - 60000) {
    return cachedToken;
  }

  console.log("Acquiring new Correos token for PUDO...");

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
    const { lat, lng, radius = 5000 } = await req.json()

    // JWT Verification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized - Missing header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const config: CorreosConfig = {
      clientId: Deno.env.get('CORREOS_CLIENT_ID') ?? '',
      clientSecret: Deno.env.get('CORREOS_CLIENT_SECRET') ?? '',
      baseUrl: Deno.env.get('CORREOS_BASE_URL') ?? Deno.env.get('CORREOS_BASE_PRE_PROD_URL') ?? 'https://api-pre.correos.es',
      authUrl: Deno.env.get('CORREOS_AUTH_URL') ?? 'https://apioauthcid.correos.es/Api/Authorize/Token',
      scope: Deno.env.get('CORREOS_SCOPE') ?? 'Preregistro' // Assuming preregistro scope might work, or terminals if configured
    }

    if (!config.clientId || !config.clientSecret) {
      throw new Error('Missing Correos credentials')
    }

    try {
      const url = new URL(`${config.baseUrl}/logistics/terminals/api/v1/homepaqs`)
      url.searchParams.append('latitude', lat.toString())
      url.searchParams.append('longitude', lng.toString())
      url.searchParams.append('distance', radius.toString())

      // Some Correos APIs (like terminals) require headers directly
      // regardless of OAuth token presence.
      const response = await fetchWithAuth(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'client_id': config.clientId,
          'client_secret': config.clientSecret
        }
      }, config)

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Correos API Error: ${response.status} ${response.statusText} - ${errText}`)
      }

      const data = await response.json()
      const content = data.content || data || []

      // Map Correos TerminalInfoResponseDTO to our internal format
      const results = content.map((term: any) => {
        // Handle coordinates which often come with commas in Spanish API
        const parseCoord = (val: any) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') return parseFloat(val.replace(',', '.'));
          return 0;
        };

        return {
          id_correos_pudo: term.terminalId || term.codHomepaq || term.id,
          nombre: term.alias || term.channelDescription || term.name || "Oficina de Correos",
          direccion: term.address || term.direccion,
          cp: term.postalCode || term.cp,
          ciudad: term.municipality || term.poblacion || term.location,
          lat: parseCoord(term.latitudeWGS84 || term.latitudeETRS89 || term.latitude || term.lat),
          lng: parseCoord(term.longitudeWGS84 || term.longitudeETRS89 || term.longitude || term.lng),
          horario: term.openingDescription || term.openingHours || term.fullSchedule || "Consultar en oficina",
          tipo_punto: term.terminalType === "P" || term.terminalType === "PUBLICO" ? "Citypaq" : "Oficina"
        };
      })

      return new Response(
        JSON.stringify(results),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (apiError) {
      console.error('Correos API error:', apiError)
      // Fallback or rethrow
      throw apiError
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
