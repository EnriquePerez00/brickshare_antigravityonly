import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface OrderData {
    id: string;
    user_id: string;
    set_ref: string | null;
    estado_envio: string;
    updated_at: string;
    sets?: {
        set_name: string;
        set_image_url: string | null;
        set_theme: string;
        set_piece_count: number;
    } | null;
}

export const useOrders = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["orders", user?.id],
        queryFn: async () => {
            if (!user) throw new Error("User not authenticated");

            // Fetch envios and join with sets on set_ref
            // Note: We use !inner join if we only want envios with valid sets, 
            // used left join here in case set_ref is missing or set deleted
            const { data, error } = await supabase
                .from("envios")
                .select(`
                  id,
                  user_id,
                  set_ref,
                  estado_envio,
                  updated_at,
                  sets:sets!left(set_name, set_image_url, set_theme, set_piece_count)
                `)
                .eq("user_id", user.id)
                .order("updated_at", { ascending: false });

            // We need to match valid set_ref join. 
            // In Supabase JOIN syntax: table!fk(col). 
            // But here we are joining on a non-FK column 'set_ref' manually?
            // Wait, existing sets table definition: set_ref is NOT a foreign key in envios table definition from migration 20260127125500.
            // It just added "ADD COLUMN set_ref TEXT". It did NOT make it a FK.
            // Supabase client join requires a foreign key relationship detected by PostgREST.
            // If there is no FK, we CANNOT use this nested select syntax strictly on 'set_ref'.
            // However, envios.set_id IS a foreign key to sets.id.
            // Let's use set_id for the join, which is standard, and just select set_ref from envios as requested.

            // Correction: queries sets via set_id (FK)

            if (error) throw error;
            return data as unknown as OrderData[];
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
};

export const useReturnSet = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (envioId: string) => {
            // 1. Update status in database
            const { error: dbError } = await supabase
                .from("envios")
                .update({ estado_envio: "ruta_devolucion" })
                .eq("id", envioId);

            if (dbError) throw dbError;

            // 2. Trigger automatic return preregistration (Label-less)
            // This generates the code and sends the email from the Edge Function
            const { data, error: functionError } = await supabase.functions.invoke('correos-logistics', {
                body: {
                    action: 'return_preregister',
                    p_envios_id: envioId
                }
            });

            if (functionError) {
                console.error("Function Error:", functionError);
                // We don't necessarily want to fail the whole mutation if shipping API fails,
                // but for this specific flow, since it's the core requirement:
                throw new Error("Error al registrar la devolución en Correos: " + functionError.message);
            }

            return data;
        },
        onSuccess: () => {
            toast({
                title: "Devolución iniciada",
                description: "Se ha registrado la devolución y recibirás un email con el código de Correos.",
            });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: "No se pudo iniciar la devolución: " + error.message,
                variant: "destructive",
            });
        },
    });
};
