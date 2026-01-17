import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  theme: string;
  age_range: string;
  piece_count: number;
  skill_boost: string[] | null;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError);
      console.error("Error fetching products:", fetchError);
    } else {
      setProducts(data || []);
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    refreshProducts: fetchProducts,
  };
};
