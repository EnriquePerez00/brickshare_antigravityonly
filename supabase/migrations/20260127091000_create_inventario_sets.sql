-- Create inventario_sets table for detailed inventory tracking
CREATE TABLE IF NOT EXISTS public.inventario_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References to the set
    set_id UUID REFERENCES public.sets(id) ON DELETE CASCADE NOT NULL UNIQUE,
    set_ref TEXT, -- Reference to sets.lego_ref for easier querying
    
    -- Stock levels
    cantidad_total INTEGER DEFAULT 0 NOT NULL, -- Total units of this set in the system
    stock_central INTEGER DEFAULT 0 NOT NULL,  -- Units available in the central warehouse
    en_envio INTEGER DEFAULT 0 NOT NULL,       -- Units currently being shipped to users
    en_uso INTEGER DEFAULT 0 NOT NULL,         -- Units currently in possession of users
    en_devolucion INTEGER DEFAULT 0 NOT NULL,  -- Units being returned by users
    en_reparacion INTEGER DEFAULT 0 NOT NULL,  -- Units being repaired/completed
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add comment for clarity on columns
COMMENT ON TABLE public.inventario_sets IS 'Detailed tracking of set units across different states (warehouse, shipping, use, etc.)';
COMMENT ON COLUMN public.inventario_sets.set_ref IS 'Official LEGO reference number (sets.lego_ref)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventario_sets_set_id ON public.inventario_sets(set_id);
CREATE INDEX IF NOT EXISTS idx_inventario_sets_set_ref ON public.inventario_sets(set_ref);

-- Enable RLS
ALTER TABLE public.inventario_sets ENABLE ROW LEVEL SECURITY;

-- Everyone can view inventory (publicly visible or at least for authenticated users)
CREATE POLICY "Inventario is viewable by everyone"
    ON public.inventario_sets FOR SELECT
    USING (true);

-- Admins and Operadores can manage inventory
CREATE POLICY "Admins and Operadores can manage inventario"
    ON public.inventario_sets FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role IN ('admin', 'operador')
        )
    );

-- Add trigger for updated_at
CREATE TRIGGER update_inventario_sets_updated_at
    BEFORE UPDATE ON public.inventario_sets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
