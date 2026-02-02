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

    // Mock data for Correos PUDO points
    // In a real scenario, this would call the Correos API or query a daily synced table
    const mockPoints = [
      // Madrid
      {
        id_correos_pudo: "ES-2800101",
        nombre: "Oficina de Correos - C/ Alcalá 1",
        direccion: "Calle de Alcalá, 1",
        cp: "28014",
        ciudad: "Madrid",
        lat: 40.4168,
        lng: -3.7038,
        horario: "L-V: 08:30 - 20:30, S: 09:30 - 13:00",
        tipo_punto: "Oficina"
      },
      {
        id_correos_pudo: "CP-MAD-001",
        nombre: "Citypaq - Estación de Atocha",
        direccion: "Plaza del Emperador Carlos V, s/n",
        cp: "28007",
        ciudad: "Madrid",
        lat: 40.4068,
        lng: -3.6892,
        horario: "Abierto 24h",
        tipo_punto: "Citypaq"
      },
      {
        id_correos_pudo: "ES-2804301",
        nombre: "Citypaq Carrefour Hortaleza",
        direccion: "Gran Vía de Hortaleza, 1",
        cp: "28043",
        ciudad: "Madrid",
        lat: 40.4700,
        lng: -3.6400,
        horario: "L-D: 09:00-22:00",
        tipo_punto: "Citypaq"
      },
      // Barcelona
      {
        id_correos_pudo: "BCN01234",
        nombre: "Oficina Correos - Barcelona Gracia",
        direccion: "Carrer Gran de Gràcia, 120",
        cp: "08012",
        ciudad: "Barcelona",
        lat: 41.4025,
        lng: 2.1550,
        horario: "L-V: 08:30-20:30, S: 09:30-13:00",
        tipo_punto: "Oficina"
      },
      {
        id_correos_pudo: "CP-BCN-001",
        nombre: "Citypaq - Sants Estació",
        direccion: "Plaça dels Països Catalans, s/n",
        cp: "08014",
        ciudad: "Barcelona",
        lat: 41.3792,
        lng: 2.1415,
        horario: "Abierto 24h",
        tipo_punto: "Citypaq"
      },
      {
        id_correos_pudo: "ES-0800101",
        nombre: "Oficina Principal Barcelona",
        direccion: "Plaça d'Antonio López, s/n",
        cp: "08002",
        ciudad: "Barcelona",
        lat: 41.3813,
        lng: 2.1818,
        horario: "L-V: 08:30 - 20:30, S: 09:30 - 13:00",
        tipo_punto: "Oficina"
      }
    ];

    // Simple filtering based on distance
    // In a real API, the backend would handle spatial queries
    // Here we calculate rough Euclidean distance for mocking purposes
    let points = mockPoints.filter(p => {
      const d = Math.sqrt(Math.pow(p.lat - lat, 2) + Math.pow(p.lng - lng, 2));
      return d < 0.1; // Approx 10km radius for mock
    });

    // Fallback: if no points found nearby, return all (just for demo purposes so it always shows something)
    if (points.length === 0) {
      points = mockPoints;
    }

    return new Response(
      JSON.stringify(points),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
