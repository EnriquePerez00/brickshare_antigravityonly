import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DonationRequest {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  peso_estimado: number;
  metodo_entrega: 'punto-recogida' | 'recogida-domicilio';
  recompensa: 'economica' | 'social';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get user from auth header if present
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      );
      const { data: { user } } = await supabaseClient.auth.getUser();
      userId = user?.id ?? null;
    }

    // Parse and validate request body
    const body: DonationRequest = await req.json();
    
    // Validate required fields
    if (!body.nombre || typeof body.nombre !== 'string' || body.nombre.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'El nombre es obligatorio' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'El email no es válido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!body.peso_estimado || typeof body.peso_estimado !== 'number' || body.peso_estimado < 1 || body.peso_estimado > 100) {
      return new Response(
        JSON.stringify({ error: 'El peso debe estar entre 1 y 100 kg' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!['punto-recogida', 'recogida-domicilio'].includes(body.metodo_entrega)) {
      return new Response(
        JSON.stringify({ error: 'Método de entrega no válido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!['economica', 'social'].includes(body.recompensa)) {
      return new Response(
        JSON.stringify({ error: 'Tipo de recompensa no válido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      user_id: userId,
      nombre: body.nombre.trim().substring(0, 100),
      email: body.email.trim().toLowerCase().substring(0, 255),
      telefono: body.telefono?.trim().substring(0, 20) || null,
      direccion: body.direccion?.trim().substring(0, 500) || null,
      peso_estimado: Math.round(body.peso_estimado * 10) / 10,
      metodo_entrega: body.metodo_entrega,
      recompensa: body.recompensa,
      ninos_beneficiados: Math.round(body.peso_estimado * 2),
      co2_evitado: Math.round(body.peso_estimado * 2.5 * 10) / 10,
      status: 'pending',
      tracking_code: `DON-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    };

    // Insert donation into database using service role
    const { data: donation, error: insertError } = await supabaseAdmin
      .from('donations')
      .insert(sanitizedData)
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Error al registrar la donación' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate reward message
    const rewardMessage = body.recompensa === 'economica'
      ? `Has elegido la opción económica: recibirás un vale de ${Math.round(body.peso_estimado * 5)}€ de descuento en tu próxima suscripción Brick Master.`
      : `Has elegido la opción social: donaremos ${Math.round(body.peso_estimado * 3)}€ a centros colaboradores de BrickShare en tu nombre.`;

    const deliveryMessage = body.metodo_entrega === 'punto-recogida'
      ? 'Puedes dejar tu paquete en cualquier punto de recogida de nuestra red.'
      : 'Hemos programado una recogida a domicilio. Te contactaremos para confirmar la fecha.';

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'BrickShare <onboarding@resend.dev>',
        to: [sanitizedData.email],
        subject: '¡Gracias por tu donación a BrickShare!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #FF6B35; margin: 0; font-size: 28px;">🧱 BrickShare</h1>
              </div>
              
              <h2 style="color: #333; margin-bottom: 20px;">¡Gracias por tu donación, ${sanitizedData.nombre}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Hemos recibido tu solicitud de donación y estamos muy agradecidos por tu generosidad.
              </p>
              
              <div style="background-color: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="color: #333; margin-top: 0; margin-bottom: 16px;">Resumen de tu donación</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Código de seguimiento:</td>
                    <td style="padding: 8px 0; color: #FF6B35; font-weight: bold; text-align: right;">${sanitizedData.tracking_code}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Peso estimado:</td>
                    <td style="padding: 8px 0; color: #333; text-align: right;">${sanitizedData.peso_estimado} kg</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Niños beneficiados:</td>
                    <td style="padding: 8px 0; color: #333; text-align: right;">${sanitizedData.ninos_beneficiados} / mes</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">CO₂ evitado:</td>
                    <td style="padding: 8px 0; color: #333; text-align: right;">${sanitizedData.co2_evitado} kg</td>
                  </tr>
                </table>
              </div>
              
              <div style="background-color: #FFF5F0; border-left: 4px solid #FF6B35; padding: 16px; margin-bottom: 24px;">
                <p style="color: #333; margin: 0; line-height: 1.6;">
                  <strong>Tu recompensa:</strong><br>
                  ${rewardMessage}
                </p>
              </div>
              
              <div style="background-color: #F0F9FF; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #333; margin: 0; line-height: 1.6;">
                  <strong>Próximos pasos:</strong><br>
                  ${deliveryMessage}
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                Recuerda: no hace falta que limpies ni ordenes las piezas. Nosotros nos encargamos de todo.
              </p>
              
              <div style="text-align: center; padding-top: 24px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  ¿Tienes preguntas? Contáctanos en hola@brickshare.es
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      // Email failed but donation was saved - still return success
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Donación registrada correctamente',
        donation: {
          id: donation.id,
          tracking_code: sanitizedData.tracking_code,
          ninos_beneficiados: sanitizedData.ninos_beneficiados,
          co2_evitado: sanitizedData.co2_evitado
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
