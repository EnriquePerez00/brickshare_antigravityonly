-- Migration: Add PUDO fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS pudo_id_correos TEXT,
ADD COLUMN IF NOT EXISTS pudo_nombre TEXT,
ADD COLUMN IF NOT EXISTS pudo_direccion_completa TEXT,
ADD COLUMN IF NOT EXISTS pudo_tipo TEXT,
ADD COLUMN IF NOT EXISTS pudo_fecha_seleccion TIMESTAMPTZ;

-- Allow users to update their own PUDO preferences
CREATE POLICY "Users can update their own PUDO fields" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
