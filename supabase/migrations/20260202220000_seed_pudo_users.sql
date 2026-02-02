-- Migration: Seed PUDO data for test users
-- This script prepopulates PUDO points for user2@brickshare.com and user3@brickshare.com

DO $$
DECLARE
    v_user2_id UUID;
    v_user3_id UUID;
BEGIN
    -- 1. Try to find user2 ID
    SELECT id INTO v_user2_id FROM auth.users WHERE email = 'user2@brickshare.com';
    
    -- 1b. If user2 exists, insert PUDO data (Barcelona)
    IF v_user2_id IS NOT NULL THEN
        -- Check if PUDO already exists to avoid duplicates (though ON CONFLICT could handle it if we had a constraint, current PK is user_id)
        DELETE FROM public.users_correos_dropping WHERE user_id = v_user2_id;

        INSERT INTO public.users_correos_dropping (
            user_id,
            correos_id_pudo,
            correos_nombre,
            correos_tipo_punto,
            correos_direccion_calle,
            correos_direccion_numero,
            correos_codigo_postal,
            correos_ciudad,
            correos_provincia,
            correos_pais,
            correos_direccion_completa,
            correos_latitud,
            correos_longitud,
            correos_horario_apertura,
            correos_disponible,
            correos_servicios_adicionales
        ) VALUES (
            v_user2_id,
            'BCN01234',
            'Oficina Correos - Barcelona Gracia',
            'Oficina',
            'Carrer Gran de Gràcia',
            '120',
            '08012',
            'Barcelona',
            'Barcelona',
            'España',
            'Carrer Gran de Gràcia, 120, 08012 Barcelona',
            41.4025,
            2.1550,
            'L-V: 08:30-20:30, S: 09:30-13:00',
            TRUE,
            ARRAY['Admite recogida', 'Admite entrega']
        );
        RAISE NOTICE 'Seeded PUDO data for user2 (Barcelona)';
    ELSE
        RAISE NOTICE 'User user2@brickshare.com not found. Skipping PUDO seed.';
    END IF;

    -- 2. Try to find user3 ID
    SELECT id INTO v_user3_id FROM auth.users WHERE email = 'user3@brickshare.com';

    -- 2b. If user3 exists, insert PUDO data (Madrid)
    IF v_user3_id IS NOT NULL THEN
        DELETE FROM public.users_correos_dropping WHERE user_id = v_user3_id;

        INSERT INTO public.users_correos_dropping (
            user_id,
            correos_id_pudo,
            correos_nombre,
            correos_tipo_punto,
            correos_direccion_calle,
            correos_direccion_numero,
            correos_codigo_postal,
            correos_ciudad,
            correos_provincia,
            correos_pais,
            correos_direccion_completa,
            correos_latitud,
            correos_longitud,
            correos_horario_apertura,
            correos_disponible,
            correos_servicios_adicionales
        ) VALUES (
            v_user3_id,
            'MAD56789',
            'Citypaq Carrefour Hortaleza',
            'Citypaq',
            'Gran Vía de Hortaleza',
            '1',
            '28043',
            'Madrid',
            'Madrid',
            'España',
            'Gran Vía de Hortaleza, 1, 28043 Madrid',
            40.4700,
            -3.6400,
            'L-D: 09:00-22:00',
            TRUE,
            ARRAY['Parking disponible', 'Accesible']
        );
        RAISE NOTICE 'Seeded PUDO data for user3 (Madrid Citypaq)';
    ELSE
        RAISE NOTICE 'User user3@brickshare.com not found. Skipping PUDO seed.';
    END IF;

END $$;
