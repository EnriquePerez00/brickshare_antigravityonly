import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SetData {
  id: string;
  set_name: string;
  set_description: string | null;
  set_image_url: string | null;
  set_theme: string;
  set_age_range: string;
  set_piece_count: number;
  skill_boost: string[] | null;
  created_at: string;
  year_released: number | null;
  set_weight: number | null;
  catalogue_visibility: boolean;
  set_ref: string | null;
}

export const useSets = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ["sets", limit, offset],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sets")
        .select("id, set_name, set_description, set_image_url, set_theme, set_age_range, set_piece_count, skill_boost, created_at, year_released, set_weight, catalogue_visibility, set_ref")
        .eq("catalogue_visibility", true)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data as SetData[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
