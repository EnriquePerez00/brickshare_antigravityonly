-- Migration: Create USERS_Correos_dropping table for storing selected PUDO points
-- This table stores the Correos PUDO (Pick Up Drop Off) point information selected by users

CREATE TABLE IF NOT EXISTS public.users_correos_dropping (
    -- Primary key and user reference
    user_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    
    -- Correos PUDO Point fields (all prefixed with "correos_")
    correos_id_pudo TEXT NOT NULL,  -- Unique identifier from Correos API
    correos_nombre TEXT NOT NULL,  -- Name of the PUDO point (e.g., "Oficina de Correos - Barcelona Centro")
    correos_tipo_punto TEXT NOT NULL CHECK (correos_tipo_punto IN ('Oficina', 'Citypaq', 'Locker')),  -- Type of point
    
    -- Address information
    correos_direccion_calle TEXT NOT NULL,  -- Street address
    correos_direccion_numero TEXT,  -- Street number
    correos_codigo_postal TEXT NOT NULL,  -- Postal code (5 digits)
    correos_ciudad TEXT NOT NULL,  -- City name
    correos_provincia TEXT NOT NULL,  -- Province
    correos_pais TEXT NOT NULL DEFAULT 'España',  -- Country
    correos_direccion_completa TEXT NOT NULL,  -- Full formatted address
    
    -- Geolocation
    correos_latitud DECIMAL(10, 8) NOT NULL,  -- Latitude
    correos_longitud DECIMAL(11, 8) NOT NULL,  -- Longitude
    
    -- Operating hours and availability
    correos_horario_apertura TEXT,  -- Opening hours description (e.g., "L-V: 9:00-20:00, S: 9:00-14:00")
    correos_horario_estructurado JSONB,  -- Structured schedule data from API (if available)
    correos_disponible BOOLEAN NOT NULL DEFAULT TRUE,  -- Whether the point is currently available
    
    -- Contact information
    correos_telefono TEXT,  -- Phone number
    correos_email TEXT,  -- Contact email
    
    -- Additional metadata
    correos_codigo_interno TEXT,  -- Internal Correos code (if different from id_pudo)
    correos_capacidad_lockers INTEGER,  -- Number of available lockers (for Citypaq/Locker types)
    correos_servicios_adicionales TEXT[],  -- Additional services (e.g., packaging, certified mail)
    correos_accesibilidad BOOLEAN DEFAULT FALSE,  -- Wheelchair accessible
    correos_parking BOOLEAN DEFAULT FALSE,  -- Parking available
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    correos_fecha_seleccion TIMESTAMPTZ NOT NULL DEFAULT NOW()  -- When user selected this point
);

-- Create index on user_id for faster lookups (though it's already a PK)
CREATE INDEX IF NOT EXISTS idx_users_correos_dropping_user_id ON public.users_correos_dropping(user_id);

-- Create index on postal code for potential queries
CREATE INDEX IF NOT EXISTS idx_users_correos_dropping_cp ON public.users_correos_dropping(correos_codigo_postal);

-- Create index on tipo_punto for filtering
CREATE INDEX IF NOT EXISTS idx_users_correos_dropping_tipo ON public.users_correos_dropping(correos_tipo_punto);

-- Enable Row Level Security
ALTER TABLE public.users_correos_dropping ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own PUDO selection
CREATE POLICY "Users can view their own Correos PUDO selection"
ON public.users_correos_dropping
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own PUDO selection
CREATE POLICY "Users can insert their own Correos PUDO selection"
ON public.users_correos_dropping
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own PUDO selection
CREATE POLICY "Users can update their own Correos PUDO selection"
ON public.users_correos_dropping
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own PUDO selection
CREATE POLICY "Users can delete their own Correos PUDO selection"
ON public.users_correos_dropping
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_users_correos_dropping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users_correos_dropping_updated_at
    BEFORE UPDATE ON public.users_correos_dropping
    FOR EACH ROW
    EXECUTE FUNCTION public.update_users_correos_dropping_updated_at();

-- Add comment to table
COMMENT ON TABLE public.users_correos_dropping IS 'Stores user-selected Correos PUDO (Pick Up Drop Off) points for delivery and pickup';
