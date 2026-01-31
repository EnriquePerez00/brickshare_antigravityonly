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

            if (error) throw error;

            return {
                clientSecret: data.clientSecret,
                subscriptionId: data.subscriptionId
            };
        } catch (error) {
            console.error("Error creating subscription intent:", error);
            toast({
                title: "Error",
                description: "No se pudo iniciar el proceso de pago",
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
