import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lat, lng, radius = 5000 } = await req.json()

    const clientId = Deno.env.get('CORREOS_CLIENT_ID')
    const clientSecret = Deno.env.get('CORREOS_CLIENT_SECRET')
    const baseUrl = Deno.env.get('CORREOS_BASE_URL') || 'https://api-pre.correos.es'

    if (!clientId || !clientSecret) {
      throw new Error('Missing Correos credentials')
    }

    try {
      const url = new URL(`${baseUrl}/logistics/terminals/api/v1/homepaqs`)
      url.searchParams.append('latitude', lat.toString())
      url.searchParams.append('longitude', lng.toString())
      url.searchParams.append('distance', radius.toString())

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'client_id': clientId,
          'client_secret': clientSecret,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Correos API Error: ${response.statusText}`)
      }

      const data = await response.json()

      // Map Correos TerminalInfoListPageableDTO to our internal format
      // Based on terminals.yaml TerminalInfoListPageableDTO -> TerminalInfoDTO
      const results = (data.content || data).map((term: any) => ({
        id_correos_pudo: term.codHomepaq || term.terminalId,
        nombre: term.desHomepaq || term.name,
        direccion: term.address,
        cp: term.postalCode,
        ciudad: term.municipality,
        lat: term.latitude,
        lng: term.longitude,
        horario: term.openingHours || "Consultar en oficina",
        tipo_punto: term.terminalType || "Citypaq"
      }))

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
