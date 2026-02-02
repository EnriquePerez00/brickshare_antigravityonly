-- Update preview function to include set_price from sets table
-- Uses COALESCE to provide 100 EUR default if set_price is NULL

CREATE OR REPLACE FUNCTION public.preview_assign_sets_to_users()
RETURNS TABLE (
    user_id UUID,
    user_name TEXT,
    set_id UUID,
    set_name TEXT,
    set_ref TEXT,
    set_price DECIMAL,
    current_stock INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (u.user_id)
        u.user_id,
        u.full_name AS user_name,
        w.set_id,
        s.set_name,
        s.set_ref,
        COALESCE(s.set_price, 100.00) AS set_price,
        i.inventory_set_total_qty AS current_stock
    FROM public.users u
    JOIN public.wishlist w ON w.user_id = u.user_id
    JOIN public.inventory_sets i ON w.set_id = i.set_id
    JOIN public.sets s ON w.set_id = s.id
    WHERE u.user_status IN ('sin set', 'set en devolucion')
      AND i.inventory_set_total_qty > 0
    ORDER BY u.user_id, w.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.preview_assign_sets_to_users IS 'Shows proposed set assignments with set_price (default 100 EUR if NULL) - for preview/confirmation flow';
