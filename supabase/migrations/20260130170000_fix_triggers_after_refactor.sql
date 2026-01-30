-- Fix triggers and functions after the global refactor (profiles -> users)

-- 1. Update handle_new_user function to reference 'users' instead of 'profiles'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (user_id, full_name, user_status)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', 'sin set');
    
    -- Assign default 'user' role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- 2. Update update_updated_at_column trigger for the renamed 'users' table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Ensure RLS is updated for the new table name 'users'
-- Note: 'ALTER TABLE RENAME' usually preserves policies, but let's be safe.
-- We can check if policies exist or recreate them if needed.
