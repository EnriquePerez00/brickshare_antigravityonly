import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OrderData {
    id: string;
    user_id: string;
    set_id: string | null;
    order_date: string;
    shipped_date: string | null;
    delivered_date: string | null;
    returned_date: string | null;
    status: string;
    tracking_number: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    sets?: {
        id: string;
        name: string;
        image_url: string | null;
        theme: string;
        piece_count: number;
    } | null;
}

export const useOrders = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["orders", user?.id],
        queryFn: async () => {
            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("orders" as any)
                .select(`
          *,
          sets:set_id (
            id,
            name,
            image_url,
            theme,
            piece_count
          )
        `)
                .eq("user_id", user.id)
                .order("order_date", { ascending: false });

            if (error) throw error;
            return data as OrderData[];
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
};
