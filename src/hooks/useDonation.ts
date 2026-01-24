import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const donationSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(100, "El nombre es demasiado largo"),
  email: z.string().trim().email("El email no es válido").max(255, "El email es demasiado largo"),
  telefono: z.string().trim().max(20, "El teléfono es demasiado largo").optional().or(z.literal("")),
  direccion: z.string().trim().max(500, "La dirección es demasiado larga").optional().or(z.literal("")),
  peso_estimado: z.number().min(1, "El peso mínimo es 1 kg").max(100, "El peso máximo es 100 kg"),
  metodo_entrega: z.enum(["punto-recogida", "recogida-domicilio"], {
    errorMap: () => ({ message: "Selecciona un método de entrega" }),
  }),
  recompensa: z.enum(["economica", "social"], {
    errorMap: () => ({ message: "Selecciona una recompensa" }),
  }),
});

export type DonationFormData = z.infer<typeof donationSchema>;

interface DonationResult {
  success: boolean;
  donation?: {
    id: string;
    tracking_code: string;
    ninos_beneficiados: number;
    co2_evitado: number;
  };
  error?: string;
}

export const useDonation = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DonationResult | null>(null);

  const submitDonation = async (data: DonationFormData): Promise<DonationResult> => {
    setIsLoading(true);
    setResult(null);

    // Validate data client-side first
    const validation = donationSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || "Datos inválidos";
      toast({
        title: "Error de validación",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }

    try {
      const { data: responseData, error } = await supabase.functions.invoke("submit-donation", {
        body: validation.data,
      });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo registrar la donación. Inténtalo de nuevo.",
          variant: "destructive",
        });
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (responseData?.error) {
        toast({
          title: "Error",
          description: responseData.error,
          variant: "destructive",
        });
        setIsLoading(false);
        return { success: false, error: responseData.error };
      }

      toast({
        title: "¡Donación registrada!",
        description: "Recibirás un email con los detalles.",
      });

      const successResult: DonationResult = {
        success: true,
        donation: responseData.donation,
      };
      
      setResult(successResult);
      setIsLoading(false);
      return successResult;
    } catch (err) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Inténtalo de nuevo.",
        variant: "destructive",
      });
      setIsLoading(false);
      return { success: false, error: "Error inesperado" };
    }
  };

  const resetResult = () => setResult(null);

  return {
    submitDonation,
    isLoading,
    result,
    resetResult,
  };
};
