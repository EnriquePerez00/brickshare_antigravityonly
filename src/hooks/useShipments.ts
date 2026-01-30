import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ShipmentData {
    id: string;
    order_id: string;
    user_id: string;
    set_ref: string | null;
    fecha_asignada: string | null;
    fecha_entrega: string | null;
    fecha_entrega_real: string | null;
    fecha_entrega_usuario: string | null;
    fecha_recepcion_almacen: string | null;
    fecha_recogida_almacen: string | null;
    fecha_solicitud_devolucion: string | null;
    fecha_devolucion_estimada: string | null;
    estado_envio: string;
    direccion_envio: string;
    ciudad_envio: string;
    codigo_postal_envio: string;
    pais_envio: string;
    proveedor_envio: string | null;
    proveedor_recogida: string | null;
    numero_seguimiento: string | null;
    costo_envio: number | null;
    transportista: string | null;
    notas_adicionales: string | null;
    created_at: string;
    updated_at: string;
    orders?: {
        id: string;
        sets?: {
            id: string;
            set_name: string;
            set_ref: string;
        } | null;
    } | null;
    users?: {
        full_name: string | null;
        email: string | null;
        user_id: string;
    } | null;
}

export const useShipments = () => {
    const { user, isOperador, isAdmin } = useAuth();

    return useQuery({
        queryKey: ["admin-shipments"],
        queryFn: async () => {
            if (!user || (!isOperador && !isAdmin)) {
                throw new Error("Unauthorized");
            }

            const { data, error } = await supabase
                .from("envios" as any)
                .select(`
                    *,
                    orders:order_id (
                        id,
                        sets:set_id (
                            id,
                            set_name,
                            set_ref
                        )
                    ),
                    users:user_id (
                        full_name,
                        email,
                        user_id
                    )
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as unknown as ShipmentData[];
        },
        enabled: !!user && (isOperador || isAdmin),
    });
};
