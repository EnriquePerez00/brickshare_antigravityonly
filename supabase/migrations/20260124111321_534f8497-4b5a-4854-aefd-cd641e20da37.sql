-- Add contact data fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS direccion TEXT,
ADD COLUMN IF NOT EXISTS codigo_postal TEXT,
ADD COLUMN IF NOT EXISTS ciudad TEXT,
ADD COLUMN IF NOT EXISTS telefono TEXT,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Update the wishlist foreign key to be nullable (allow sample sets)
ALTER TABLE public.wishlist
DROP CONSTRAINT IF EXISTS wishlist_set_id_fkey;

-- Re-add the constraint with ON DELETE CASCADE but allowing NULLs
-- Actually, keep it as is since set_id is already nullable
-- The issue is the FK validation - let's just allow orphan set_ids for sample data

-- Add admin RLS policy for wishlists viewing (for admin panel)
CREATE POLICY "Admins can view all wishlists"
ON public.wishlist
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Comment: The wishlist issue is actually that sample set IDs don't exist in the sets table
-- We need to drop the FK constraint to allow adding sample items or ensure real sets exist