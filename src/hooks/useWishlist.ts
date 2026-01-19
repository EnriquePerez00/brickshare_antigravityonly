import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useWishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds([]);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from("wishlist")
      .select("set_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching wishlist:", error);
    } else {
      setWishlistIds(data.map((item) => item.set_id));
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (setId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para añadir sets a tu wishlist",
        variant: "destructive",
      });
      return false;
    }

    const isCurrentlyWishlisted = wishlistIds.includes(setId);

    // Optimistic update
    if (isCurrentlyWishlisted) {
      setWishlistIds((prev) => prev.filter((id) => id !== setId));
    } else {
      setWishlistIds((prev) => [...prev, setId]);
    }

    if (isCurrentlyWishlisted) {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("set_id", setId);

      if (error) {
        // Rollback on error
        setWishlistIds((prev) => [...prev, setId]);
        toast({
          title: "Error",
          description: "No se pudo eliminar de la wishlist",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Eliminado",
        description: "Set eliminado de tu wishlist",
      });
    } else {
      const { error } = await supabase
        .from("wishlist")
        .insert({ user_id: user.id, set_id: setId });

      if (error) {
        // Rollback on error
        setWishlistIds((prev) => prev.filter((id) => id !== setId));
        toast({
          title: "Error",
          description: "No se pudo añadir a la wishlist",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Añadido",
        description: "Set añadido a tu wishlist",
      });
    }

    return true;
  };

  const isWishlisted = (setId: string) => wishlistIds.includes(setId);

  return {
    wishlistIds,
    isLoading,
    toggleWishlist,
    isWishlisted,
    refreshWishlist: fetchWishlist,
  };
};
