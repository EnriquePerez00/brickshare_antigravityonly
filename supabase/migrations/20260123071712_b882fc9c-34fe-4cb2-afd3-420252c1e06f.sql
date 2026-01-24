-- Create donations table
CREATE TABLE public.donations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    direccion TEXT,
    peso_estimado NUMERIC NOT NULL,
    metodo_entrega TEXT NOT NULL CHECK (metodo_entrega IN ('punto-recogida', 'recogida-domicilio')),
    recompensa TEXT NOT NULL CHECK (recompensa IN ('economica', 'social')),
    ninos_beneficiados INTEGER NOT NULL,
    co2_evitado NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'received', 'processed', 'completed')),
    tracking_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Users can view their own donations
CREATE POLICY "Users can view their own donations" 
ON public.donations 
FOR SELECT 
USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Users can create donations (authenticated or not via edge function)
CREATE POLICY "Anyone can insert donations via edge function" 
ON public.donations 
FOR INSERT 
WITH CHECK (true);

-- Admins can manage all donations
CREATE POLICY "Admins can manage all donations" 
ON public.donations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_donations_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_donations_email ON public.donations(email);
CREATE INDEX idx_donations_status ON public.donations(status);