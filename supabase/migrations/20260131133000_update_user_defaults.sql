-- Update user defaults and add constraints

-- 1. Create or replace the function to handle new user defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (user_id, email, full_name, avatar_url, subscription_status, user_status)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'inactive', -- Default subscription status
    'sin set'   -- Default user status
  );
  RETURN new;
END;
$$;

-- 2. Add check constraint for subscription_status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_subscription_status_check'
    ) THEN
        ALTER TABLE public.users
        ADD CONSTRAINT users_subscription_status_check
        CHECK (subscription_status IN ('active', 'inactive'));
    END IF;
END $$;
