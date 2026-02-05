-- Add RLS policy for Operadores to view all shipments
-- Currently, they might only have permissions to view their own or update/insert, but not list all for the dashboard.

ALTER TABLE public.envios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and Operadores can view all shipments"
    ON public.envios FOR SELECT
    USING (
        public.has_role(auth.uid(), 'admin'::public.app_role) OR 
        public.has_role(auth.uid(), 'operador'::public.app_role)
    );

-- Note: 'Admins can manage all shipments' (FOR ALL) might already cover admins, but explicit Select for operadors is safer.
-- If 'Admins can manage all shipments' exists, this might duplicate for admin, but Postgres handles multiple policies as OR.
-- To be clean, we could drop the admin-only select if it exists, but the FOR ALL usually covers it.
-- Let's just ensure Operadores are covered.
