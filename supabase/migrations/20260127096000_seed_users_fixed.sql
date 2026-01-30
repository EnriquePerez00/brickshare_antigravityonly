-- Fixed seeding for sample users and wishlists
DO $$
DECLARE
    new_user_id UUID;
    sample_set_ids UUID[];
    i INT;
BEGIN
    -- Get some random sets for wishlists
    SELECT array_agg(id) INTO sample_set_ids FROM (SELECT id FROM public.sets ORDER BY RANDOM() LIMIT 20) s;

    IF sample_set_ids IS NOT NULL THEN
        FOR i IN 1..5 LOOP
            new_user_id := gen_random_uuid();
            
            -- Insert into auth.users (minimal fields)
            BEGIN
                INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, instance_id)
                VALUES (
                    new_user_id, 
                    'sample_user_' || i || '_' || substr(new_user_id::text, 1, 8) || '@brickshare.test', 
                    '$2a$10$7p0P1p0P1p0P1p0P1p0P1p0P1p0P1p0P1p0P1p0P1p0P1p0P1p0P', -- dummy hash
                    now(),
                    jsonb_build_object('full_name', 'Sample User ' || i),
                    'authenticated',
                    'authenticated',
                    '00000000-0000-0000-0000-000000000000'
                );

                -- We don't need to manually insert into profiles if the trigger 'on_auth_user_created' works.
                -- But we ensure the status is set correctly.
                -- Wait, the trigger might not have run if we are inserting manually into auth.users in some environments.
                -- Let's double check or do a manual insert if it doesn't exist.
                
                INSERT INTO public.profiles (user_id, full_name, estado_usuario)
                VALUES (new_user_id, 'Sample User ' || i, 'sin set')
                ON CONFLICT (user_id) DO UPDATE SET estado_usuario = 'sin set';

                -- Add 3 random items to wishlist (using correct column: set_id)
                FOR j IN 1..3 LOOP
                    INSERT INTO public.wishlist (user_id, set_id)
                    VALUES (new_user_id, sample_set_ids[1 + ( floor(random() * array_length(sample_set_ids, 1)) )::int])
                    ON CONFLICT DO NOTHING;
                END LOOP;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not create sample user %: %', i, SQLERRM;
            END;
        END LOOP;
    END IF;
END $$;
