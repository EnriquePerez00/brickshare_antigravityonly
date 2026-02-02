import { supabase } from "@/integrations/supabase/client";

export interface CorreosPudoPoint {
    user_id: string;
    correos_id_pudo: string;
    correos_nombre: string;
    correos_tipo_punto: "Oficina" | "Citypaq" | "Locker";
    correos_direccion_calle: string;
    correos_direccion_numero?: string;
    correos_codigo_postal: string;
    correos_ciudad: string;
    correos_provincia: string;
    correos_pais: string;
    correos_direccion_completa: string;
    correos_latitud: number;
    correos_longitud: number;
    correos_horario_apertura?: string;
    correos_horario_estructurado?: any;
    correos_disponible: boolean;
    correos_telefono?: string;
    correos_email?: string;
    correos_codigo_interno?: string;
    correos_capacidad_lockers?: number;
    correos_servicios_adicionales?: string[];
    correos_accesibilidad?: boolean;
    correos_parking?: boolean;
    created_at?: string;
    updated_at?: string;
    correos_fecha_seleccion?: string;
}

/**
 * Get the user's selected Correos PUDO point
 */
export async function getUserPudoPoint(userId: string): Promise<CorreosPudoPoint | null> {
    const { data, error } = await supabase
        .from("users_correos_dropping")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            // No rows found
            return null;
        }
        throw error;
    }

    return data;
}

/**
 * Save or update the user's selected Correos PUDO point
 */
export async function saveUserPudoPoint(userId: string, pudoData: Partial<CorreosPudoPoint>): Promise<void> {
    const { error } = await supabase
        .from("users_correos_dropping")
        .upsert({
            user_id: userId,
            ...pudoData,
            correos_fecha_seleccion: new Date().toISOString(),
        });

    if (error) throw error;
}

/**
 * Delete the user's selected Correos PUDO point
 */
export async function deleteUserPudoPoint(userId: string): Promise<void> {
    const { error } = await supabase
        .from("users_correos_dropping")
        .delete()
        .eq("user_id", userId);

    if (error) throw error;
}
