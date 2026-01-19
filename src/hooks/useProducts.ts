import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SetData {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  theme: string;
  age_range: string;
  piece_count: number;
  skill_boost: string[] | null;
  created_at: string;
  year: number | null;
  catalogue_visibility: boolean;
}

export const useSets = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ["sets", limit, offset],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sets")
        .select("id, name, description, image_url, theme, age_range, piece_count, skill_boost, created_at, year, catalogue_visibility")
        .eq("catalogue_visibility", true)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data as SetData[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
