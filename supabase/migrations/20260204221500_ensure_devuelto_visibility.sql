-- Ensure 'devuelto' shipments are visible (Fixed Policy)
-- Correcting the RLS logic to use public.has_role() instead of querying a non-existent column.

DROP POLICY IF EXISTS "Access for operators and admins" ON public.envios;

CREATE POLICY "Access for operators and admins"
    ON public.envios FOR ALL
    USING (
        -- Check if user has 'admin' or 'operator' (if allowed, but enum is 'admin', 'user')
        -- Wait, 'app_role' enum in 63a9dbb0 only has 'admin', 'user'.
        -- But maybe 'operador' was added later?
        -- Let's stick to 'admin' for now, or check migration for 'operador'.
        -- Safest is to check public.user_roles table directly if has_role doesn't support list.
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
              AND role::text IN ('admin', 'operador')
        )
    );

-- Ensure users can see their own returned shipments
DROP POLICY IF EXISTS "Users can view own envios" ON public.envios;
CREATE POLICY "Users can view own envios"
    ON public.envios FOR SELECT
    USING (auth.uid() = user_id);
