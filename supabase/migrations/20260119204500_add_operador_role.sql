-- Add 'operador' to app_role enum
ALTER TYPE public.app_role ADD VALUE 'operador';

-- Note: This change allows assigning the 'operador' role to users in the user_roles table.
-- Specific permissions for this role should be added to RLS policies as needed.
