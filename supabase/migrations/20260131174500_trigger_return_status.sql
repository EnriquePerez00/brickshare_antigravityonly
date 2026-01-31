-- Create a trigger to update users.user_status when a return is initiated

CREATE OR REPLACE FUNCTION public.handle_return_status_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the status changed to 'ruta_devolucion'
    IF NEW.estado_envio = 'ruta_devolucion' AND OLD.estado_envio != 'ruta_devolucion' THEN
        -- Update the user's status to 'sin set' as requested
        -- This allows them to be eligible for a new assignment immediately (Exchange flow)
        UPDATE public.users
        SET user_status = 'sin set'
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid duplication
DROP TRIGGER IF EXISTS on_envio_return_update ON public.envios;

-- Create Trigger
CREATE TRIGGER on_envio_return_update
AFTER UPDATE ON public.envios
FOR EACH ROW
EXECUTE FUNCTION public.handle_return_status_update();
