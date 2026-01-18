-- Add indexes to products table for optimized filtering and sorting
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS products_theme_idx ON public.products (theme);
CREATE INDEX IF NOT EXISTS products_age_range_idx ON public.products (age_range);
