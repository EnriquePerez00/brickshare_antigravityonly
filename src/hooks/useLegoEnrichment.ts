import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useLegoEnrichment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const fetchLegoData = async (setNumber: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke("fetch-lego-data", {
                body: { set_number: setNumber },
            });

            if (error) throw error;

            toast({
                title: "Datos obtenidos",
                description: `Se han recuperado los datos del set ${setNumber}`,
            });

            return data;
        } catch (error) {
            console.error("Error fetching LEGO data:", error);
            toast({
                title: "Error",
                description: "No se pudieron obtener los datos de Rebrickable",
                variant: "destructive",
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        fetchLegoData,
        isLoading,
    };
};
