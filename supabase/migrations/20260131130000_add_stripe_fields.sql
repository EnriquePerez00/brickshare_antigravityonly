-- Migration: Add Stripe fields to users table
-- Description: Adds fields required for Stripe integration (Customer ID, Subscription ID, etc.)

-- 1. Add columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_type TEXT;

-- 2. Add comment explaining the fields
COMMENT ON COLUMN public.users.stripe_customer_id IS 'Stripe Customer ID associated with the user';
COMMENT ON COLUMN public.users.subscription_id IS 'Current active Stripe Subscription ID';
COMMENT ON COLUMN public.users.subscription_status IS 'Status of the subscription (OK, trialing, past_due, canceled, etc.)';
COMMENT ON COLUMN public.users.subscription_type IS 'The plan level (Brick Starter, Pro, Master)';

-- 3. Add an index for faster lookups during webhooks
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);
