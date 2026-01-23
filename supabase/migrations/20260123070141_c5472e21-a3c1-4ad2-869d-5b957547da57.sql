-- Drop the overly permissive public SELECT policy on inventory
DROP POLICY IF EXISTS "Inventory is viewable by everyone" ON public.inventory;

-- Create a new policy that only allows authenticated users to view inventory
CREATE POLICY "Inventory is viewable by authenticated users" 
ON public.inventory 
FOR SELECT 
USING (auth.uid() IS NOT NULL);