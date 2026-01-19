-- Migration to create an admin user
-- Credentials: admin@brickshare.com / admin

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Check if the user already exists to avoid duplicates
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@brickshare.com') THEN
        
        -- Insert user into auth.users (Supabase internal table)
        INSERT INTO auth.users (
            instance_id,
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'admin@brickshare.com',
            crypt('admin', gen_salt('bf')), -- Password encrypted: admin
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Admin Total"}',
            now(),
            now(),
            'authenticated',
            '',
            '',
            '',
            ''
        )
        RETURNING id INTO new_user_id;

        -- The trigger 'public.handle_new_user' executes 'AFTER INSERT' on auth.users automatically.
        -- It creates the entry in public.profiles and public.user_roles (initially with role 'user').
        
        -- We wait or just ensure we update the role to 'admin'
        UPDATE public.user_roles 
        SET role = 'admin' 
        WHERE user_id = new_user_id;

    END IF;
END $$;
