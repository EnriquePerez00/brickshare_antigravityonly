-- Migration: Drop deprecated subscription_id column from users table
-- We track subscription status and type, but the raw subscription_id is not needed or used in the new flow.

ALTER TABLE public.users 
DROP COLUMN IF EXISTS subscription_id;
