-- Add RLS policy for Admins and Operadores to view all users (formerly profiles)
-- This is required for the Returns list to show user names and emails.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and Operadores can view all users"
    ON public.users FOR SELECT
    USING (
        public.has_role(auth.uid(), 'admin'::public.app_role) OR 
        public.has_role(auth.uid(), 'operador'::public.app_role)
    );
