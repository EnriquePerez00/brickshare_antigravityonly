-- Rename products table to sets
ALTER TABLE public.products RENAME TO sets;

-- Add new columns
ALTER TABLE public.sets ADD COLUMN year INTEGER;
ALTER TABLE public.sets ADD COLUMN catalogue_visibility BOOLEAN DEFAULT TRUE NOT NULL;

-- Update remaining references (Inventory relationship)
ALTER TABLE public.inventory 
RENAME CONSTRAINT inventory_product_id_fkey TO inventory_set_id_fkey;

ALTER TABLE public.inventory 
RENAME COLUMN product_id TO set_id;

-- Update remaining references (Wishlist relationship)
ALTER TABLE public.wishlist 
RENAME CONSTRAINT wishlist_product_id_fkey TO wishlist_set_id_fkey;

ALTER TABLE public.wishlist 
RENAME COLUMN product_id TO set_id;

-- Update indexes
DROP INDEX IF EXISTS products_created_at_idx;
DROP INDEX IF EXISTS products_theme_idx;
DROP INDEX IF EXISTS products_age_range_idx;

CREATE INDEX sets_created_at_idx ON public.sets (created_at DESC);
CREATE INDEX sets_theme_idx ON public.sets (theme);
CREATE INDEX sets_age_range_idx ON public.sets (age_range);
CREATE INDEX sets_year_idx ON public.sets (year);

-- Update RLS Policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.sets;
DROP POLICY IF EXISTS "Admins can insert products" ON public.sets;
DROP POLICY IF EXISTS "Admins can update products" ON public.sets;
DROP POLICY IF EXISTS "Admins can delete products" ON public.sets;

CREATE POLICY "Sets are viewable by everyone"
ON public.sets FOR SELECT
USING (true);

CREATE POLICY "Admins can insert sets"
ON public.sets FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sets"
ON public.sets FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sets"
ON public.sets FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update inventory policies to reflect column rename
DROP POLICY IF EXISTS "Inventory is viewable by everyone" ON public.inventory;
DROP POLICY IF EXISTS "Admins can manage inventory" ON public.inventory;

CREATE POLICY "Inventory is viewable by everyone"
ON public.inventory FOR SELECT
USING (true);

CREATE POLICY "Admins can manage inventory"
ON public.inventory FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update wishlist policies to reflect column rename
DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can add to their own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can remove from their own wishlist" ON public.wishlist;

CREATE POLICY "Users can view their own wishlist"
ON public.wishlist FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist"
ON public.wishlist FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist"
ON public.wishlist FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Update timestamp trigger
DROP TRIGGER IF EXISTS update_products_updated_at ON public.sets;
CREATE TRIGGER update_sets_updated_at
    BEFORE UPDATE ON public.sets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
