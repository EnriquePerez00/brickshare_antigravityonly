-- Create envios (shipments) table for tracking order shipments
CREATE TABLE IF NOT EXISTS public.envios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Shipping dates
    fecha_asignada TIMESTAMP WITH TIME ZONE, -- Assigned/pickup date
    fecha_entrega TIMESTAMP WITH TIME ZONE, -- Delivery date to user
    fecha_entrega_real TIMESTAMP WITH TIME ZONE, -- Actual delivery date
    fecha_entrega_usuario TIMESTAMP WITH TIME ZONE, -- User delivery confirmation
    fecha_recepcion_almacen TIMESTAMP WITH TIME ZONE, -- Warehouse reception date
    fecha_devolucion_estimada DATE, -- Estimated return date
    
    -- Shipping details
    estado_envio TEXT NOT NULL DEFAULT 'pendiente',
    -- possible values: 'pendiente', 'asignado', 'en_transito', 'entregado', 'devuelto', 'cancelado'
    
    direccion_envio TEXT NOT NULL,
    ciudad_envio TEXT NOT NULL,
    codigo_postal_envio TEXT NOT NULL,
    pais_envio TEXT NOT NULL DEFAULT 'España',
    
    -- Provider information
    proveedor_envio TEXT, -- Shipping provider name
    direccion_proveedor_recogida TEXT, -- Provider pickup address
    
    -- Tracking
    numero_seguimiento TEXT UNIQUE, -- Tracking number
    
    -- Costs
    costo_envio DECIMAL(10, 2),
    
    -- Additional info
    transportista TEXT, -- Carrier name
    notas_adicionales TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_envios_order_id ON public.envios(order_id);
CREATE INDEX IF NOT EXISTS idx_envios_user_id ON public.envios(user_id);
CREATE INDEX IF NOT EXISTS idx_envios_estado ON public.envios(estado_envio);
CREATE INDEX IF NOT EXISTS idx_envios_numero_seguimiento ON public.envios(numero_seguimiento);
CREATE INDEX IF NOT EXISTS idx_envios_fecha_entrega ON public.envios(fecha_entrega DESC);

-- Enable RLS
ALTER TABLE public.envios ENABLE ROW LEVEL SECURITY;

-- Users can only see their own shipments
CREATE POLICY "Users can view own shipments"
    ON public.envios FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can manage all shipments
CREATE POLICY "Admins can manage all shipments"
    ON public.envios FOR ALL
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Operadores can insert and update shipments
CREATE POLICY "Operadores can create shipments"
    ON public.envios FOR INSERT
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role) OR 
        public.has_role(auth.uid(), 'operador'::public.app_role)
    );

CREATE POLICY "Operadores can update shipments"
    ON public.envios FOR UPDATE
    USING (
        public.has_role(auth.uid(), 'admin'::public.app_role) OR 
        public.has_role(auth.uid(), 'operador'::public.app_role)
    );

-- Add trigger for updated_at
CREATE TRIGGER update_envios_updated_at
    BEFORE UPDATE ON public.envios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment to explain estado_envio values
COMMENT ON COLUMN public.envios.estado_envio IS 'Possible values: pendiente, asignado, en_transito, entregado, devuelto, cancelado';
