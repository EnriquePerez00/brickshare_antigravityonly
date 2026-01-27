-- Insert sample data for envios and operaciones_recepcion
-- This script uses existing users and sets to maintain referential integrity.

DO $$
DECLARE
    u1 UUID; u2 UUID; u3 UUID;
    s1 UUID; s2 UUID; s3 UUID;
    o1 UUID; o2 UUID; o3 UUID;
    e1 UUID; e2 UUID; e3 UUID;
BEGIN
    -- Get some existing users
    SELECT user_id INTO u1 FROM public.profiles LIMIT 1 OFFSET 0;
    SELECT user_id INTO u2 FROM public.profiles LIMIT 1 OFFSET 1;
    SELECT user_id INTO u3 FROM public.profiles LIMIT 1 OFFSET 2;
    
    -- Get some existing sets
    SELECT id INTO s1 FROM public.sets LIMIT 1 OFFSET 0;
    SELECT id INTO s2 FROM public.sets LIMIT 1 OFFSET 1;
    SELECT id INTO s3 FROM public.sets LIMIT 1 OFFSET 2;

    -- Fallback in case there are fewer than 3 unique records
    u2 := COALESCE(u2, u1);
    u3 := COALESCE(u3, u2, u1);
    s2 := COALESCE(s2, s1);
    s3 := COALESCE(s3, s2, s1);

    -- Only proceed if we have at least one user and one set
    IF u1 IS NOT NULL AND s1 IS NOT NULL THEN
        -- Example 1
        INSERT INTO public.orders (user_id, set_id, status, order_date) 
        VALUES (u1, s1, 'delivered', now() - interval '10 days') RETURNING id INTO o1;
        
        INSERT INTO public.envios (order_id, user_id, estado_envio, direccion_envio, ciudad_envio, codigo_postal_envio, fecha_asignada, fecha_recepcion_almacen, proveedor_envio)
        VALUES (o1, u1, 'devuelto', 'Calle Mayor 10', 'Madrid', '28001', now() - interval '9 days', now() - interval '1 day', 'SEUR') RETURNING id INTO e1;
        
        INSERT INTO public.operaciones_recepcion (event_id, user_id, set_id, peso_obtenido, status_recepcion, missing_parts)
        VALUES (e1, u1, s1, 1240.50, TRUE, 'Completado sin faltas');

        -- Example 2
        INSERT INTO public.orders (user_id, set_id, status, order_date) 
        VALUES (u2, s2, 'delivered', now() - interval '15 days') RETURNING id INTO o2;
        
        INSERT INTO public.envios (order_id, user_id, estado_envio, direccion_envio, ciudad_envio, codigo_postal_envio, fecha_asignada, fecha_recepcion_almacen, proveedor_envio)
        VALUES (o2, u2, 'devuelto', 'Avenida Diagonal 450', 'Barcelona', '08001', now() - interval '14 days', now() - interval '2 days', 'Correos') RETURNING id INTO e2;
        
        INSERT INTO public.operaciones_recepcion (event_id, user_id, set_id, peso_obtenido, status_recepcion, missing_parts)
        VALUES (e2, u2, s2, 890.00, TRUE, 'Falta 1x 3001 Red');

        -- Example 3
        INSERT INTO public.orders (user_id, set_id, status, order_date) 
        VALUES (u3, s3, 'delivered', now() - interval '20 days') RETURNING id INTO o3;
        
        INSERT INTO public.envios (order_id, user_id, estado_envio, direccion_envio, ciudad_envio, codigo_postal_envio, fecha_asignada, fecha_recepcion_almacen, proveedor_envio)
        VALUES (o3, u3, 'devuelto', 'Paseo de la Castellana 200', 'Madrid', '28046', now() - interval '19 days', now() - interval '3 days', 'DHL') RETURNING id INTO e3;
        
        INSERT INTO public.operaciones_recepcion (event_id, user_id, set_id, peso_obtenido, status_recepcion, missing_parts)
        VALUES (e3, u3, s3, 2100.75, TRUE, 'Completado, limpieza leve');
    END IF;
END $$;
