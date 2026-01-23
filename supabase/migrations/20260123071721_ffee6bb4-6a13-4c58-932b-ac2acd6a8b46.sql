-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can insert donations via edge function" ON public.donations;

-- Create a policy that allows service role to insert (edge function uses service role)
-- Users can only insert their own donations if authenticated
CREATE POLICY "Authenticated users can insert their own donations" 
ON public.donations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id));