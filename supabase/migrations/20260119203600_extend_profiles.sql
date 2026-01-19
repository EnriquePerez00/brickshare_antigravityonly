-- Add shipping and subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN address TEXT,
ADD COLUMN address_extra TEXT,
ADD COLUMN zip_code TEXT,
ADD COLUMN city TEXT,
ADD COLUMN province TEXT,
ADD COLUMN phone TEXT,
ADD COLUMN email TEXT,
ADD COLUMN subscription_id TEXT,
ADD COLUMN subscription_type TEXT,
ADD COLUMN subscription_status TEXT DEFAULT 'active';

-- Add comment to explain subscription_status values
COMMENT ON COLUMN public.profiles.subscription_status IS 'Possible values: active, canceled, on hold';

-- Note: The wishlist unique constraint UNIQUE (user_id, set_id) 
-- (updated previously from product_id to set_id) 
-- already allows a user to have multiple sets in their wishlist.
