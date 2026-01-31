import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useSubscription = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const startSubscription = async (plan: string, priceId: string) => {
        if (!user) {
            toast({
                title: "Error",
                description: "Debes iniciar sesión para suscribirte",
                variant: "destructive",
            });
            return null;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke("create-subscription-intent", {
                body: { plan, userId: user.id, priceId },
            });

            if (error) {
                // Parse the error body if available, or use the general error message
                let errorMessage = "No se pudo iniciar el proceso de pago";
                try {
                    // supabase.functions.invoke returns error as an object that might contain the response body
                    if (error instanceof Error) {
                        errorMessage = error.message;
                    }
                    // If the function returned a 500/400 with a JSON body, Supabase client might wrap it.
                    // However, usually `data` is null and `error` is present.
                    // The edge function returns: { error: error.message }
                    // If the invocation fails, `error` is a Supabase FunctionsHttpError or similar.

                    // Let's try to extract a more specific message if possible.
                    // If the Edge Function returns a JSON error, it might be in `context` or we just rely on the logging.
                    // Actually, Supabase invoke returns `data` as null and `error` as the error object if the status is not 2xx.
                    // If we returned a JSON { error: "..." }, it is often harder to get from the `error` object directly in the JS client without reading the body stream manually if it wasn't parsed.
                    // But let's assume `error.message` gives us something, or we log it.
                    console.error("Supabase Function Error:", error);
                    errorMessage = error.message || errorMessage;
                } catch (e) {
                    console.error("Error parsing error:", e);
                }
                throw new Error(errorMessage);
            }

            // Check if data has an error property even if status was 200 (though we return 500 on error)
            if (data?.error) {
                throw new Error(data.error);
            }

            return {
                clientSecret: data.clientSecret,
                subscriptionId: data.subscriptionId
            };
        } catch (error: any) {
            console.error("FULL ERROR OBJECT:", error);
            // Attempt to read body if it's a fetch response-like object
            if (error && typeof error.json === 'function') {
                try {
                    const body = await error.json();
                    console.error("Error Body:", body);
                } catch (e) { console.log("Could not parse error body JSON"); }
            }

            toast({
                title: "Error de configuración",
                description: (error.message || "Error desconocido") + ". Revisa la consola (F12) para más detalles.",
                variant: "destructive",
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        startSubscription,
        isLoading,
    };
};
