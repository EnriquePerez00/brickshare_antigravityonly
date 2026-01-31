-- Remove sub_status and initialize subscription_status

-- 1. Initialize subscription_status to 'inactive' where it is null
UPDATE public.users
SET subscription_status = 'inactive'
WHERE subscription_status IS NULL;

-- 2. Drop the sub_status column
ALTER TABLE public.users
DROP COLUMN IF EXISTS sub_status;
