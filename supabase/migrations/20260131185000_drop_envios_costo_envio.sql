-- Drop costo_envio column from envios table
ALTER TABLE public.envios DROP COLUMN IF EXISTS costo_envio;
