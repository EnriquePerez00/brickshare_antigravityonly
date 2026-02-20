-- Trigger: Update user status to 'con set' when shipment is delivered

CREATE OR REPLACE FUNCTION public.handle_envio_entregado()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the status changed to 'entregado'
    IF NEW.estado_envio = 'entregado' AND OLD.estado_envio != 'entregado' THEN
        -- Update the user's status to 'con set'
        UPDATE public.users
        SET user_status = 'con set'
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid duplication
DROP TRIGGER IF EXISTS on_envio_entregado ON public.envios;

-- Create Trigger
CREATE TRIGGER on_envio_entregado
AFTER UPDATE ON public.envios
FOR EACH ROW
EXECUTE FUNCTION public.handle_envio_entregado();
