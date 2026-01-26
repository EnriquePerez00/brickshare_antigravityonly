import { supabase } from "@/integrations/supabase/client";

interface SendEmailProps {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
}

export const sendEmail = async ({ to, subject, html, from }: SendEmailProps) => {
    const { data, error } = await supabase.functions.invoke("send-email", {
        body: { to, subject, html, from },
    });

    if (error) {
        console.error("Error sending email:", error);
        throw error;
    }

    return data;
};
