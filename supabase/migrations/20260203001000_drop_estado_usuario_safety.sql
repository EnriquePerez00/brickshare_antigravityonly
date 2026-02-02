-- Migration: Safety drop of legacy column estado_usuario
-- This column was renamed to user_status in 20260127100000, 
-- but we run this to ensure no zombie column remains in any environment.

ALTER TABLE public.users 
DROP COLUMN IF EXISTS estado_usuario;
