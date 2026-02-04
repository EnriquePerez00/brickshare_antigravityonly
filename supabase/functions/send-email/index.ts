
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html, text, from_name = "Brickshare" } = await req.json();

    const MAILTRAP_API_KEY = Deno.env.get('MAILTRAP_API_KEY');
    if (!MAILTRAP_API_KEY) {
      throw new Error("Missing MAILTRAP_API_KEY");
    }

    // Default sender must be verified in Mailtrap
    // Using a placeholder that user MUST configure in Dashboard or pass in body
    const from_email = Deno.env.get('MAILTRAP_FROM_EMAIL') || "info@brickshare.es";

    const response = await fetch("https://send.api.mailtrap.io/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MAILTRAP_API_KEY}`,
      },
      body: JSON.stringify({
        from: {
          email: from_email,
          name: from_name,
        },
        to: [
          {
            email: to,
          },
        ],
        subject: subject,
        html: html,
        text: text || "Brickshare Notification",
        category: "Notification"
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      // Mailtrap error format might differ, logging raw text
      throw new Error(`Mailtrap Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
