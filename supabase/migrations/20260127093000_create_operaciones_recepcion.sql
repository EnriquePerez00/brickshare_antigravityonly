-- Create operations_recepcion table to track set returns reception
CREATE TABLE IF NOT EXISTS public.operaciones_recepcion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.envios(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    set_id UUID REFERENCES public.sets(id) ON DELETE CASCADE NOT NULL,
    peso_obtenido NUMERIC(10, 2),
    status_recepcion BOOLEAN DEFAULT FALSE NOT NULL,
    missing_parts TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.operaciones_recepcion ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Enable read access for authenticated users"
    ON public.operaciones_recepcion FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for admins and operators"
    ON public.operaciones_recepcion FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role) OR 
        public.has_role(auth.uid(), 'operador'::public.app_role)
    );

CREATE POLICY "Enable update for admins and operators"
    ON public.operaciones_recepcion FOR UPDATE
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin'::public.app_role) OR 
        public.has_role(auth.uid(), 'operador'::public.app_role)
    )
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role) OR 
        public.has_role(auth.uid(), 'operador'::public.app_role)
    );

-- Add updated_at trigger
CREATE TRIGGER update_operaciones_recepcion_updated_at
    BEFORE UPDATE ON public.operaciones_recepcion
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_operaciones_recepcion_user_id ON public.operaciones_recepcion(user_id);
CREATE INDEX IF NOT EXISTS idx_operaciones_recepcion_set_id ON public.operaciones_recepcion(set_id);
CREATE INDEX IF NOT EXISTS idx_operaciones_recepcion_event_id ON public.operaciones_recepcion(event_id);

-- Add comments
COMMENT ON TABLE public.operaciones_recepcion IS 'Table to record the reception and maintenance check of sets returned by users.';
COMMENT ON COLUMN public.operaciones_recepcion.peso_obtenido IS 'Actual weight of the set upon reception (in grams).';
COMMENT ON COLUMN public.operaciones_recepcion.status_recepcion IS 'True if the reception process is completed.';
COMMENT ON COLUMN public.operaciones_recepcion.missing_parts IS 'Details or notes about missing pieces found during reception.';
