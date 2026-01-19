-- Create enum for operation types
CREATE TYPE public.operation_type AS ENUM (
    'recepcion paquete',
    'analisis_peso',
    'deposito_fulfillment',
    'higienizado',
    'retorno_stock'
);

-- Create backoffice_operations table
CREATE TABLE public.backoffice_operations (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    operation_type public.operation_type NOT NULL,
    operation_time TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    metadata JSONB -- Optional, for extra details like weight values or box numbers
);

-- Enable RLS
ALTER TABLE public.backoffice_operations ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins and Operadores can view and insert operations
CREATE POLICY "Admins and Operators can view operations"
ON public.backoffice_operations FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'operador')
);

CREATE POLICY "Admins and Operators can log operations"
ON public.backoffice_operations FOR INSERT
TO authenticated
WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'operador')
);

-- Indexes for audit performance
CREATE INDEX idx_backoff_ops_user_id ON public.backoffice_operations(user_id);
CREATE INDEX idx_backoff_ops_time ON public.backoffice_operations(operation_time);
CREATE INDEX idx_backoff_ops_type ON public.backoffice_operations(operation_type);
