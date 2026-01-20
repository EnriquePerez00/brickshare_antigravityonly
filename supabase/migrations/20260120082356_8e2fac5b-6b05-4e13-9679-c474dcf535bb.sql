-- Create the 'sets' table with all required columns
CREATE TABLE public.sets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    lego_ref TEXT,
    description TEXT,
    image_url TEXT,
    theme TEXT NOT NULL,
    age_range TEXT NOT NULL,
    piece_count INTEGER NOT NULL,
    skill_boost TEXT[],
    year_released INTEGER,
    weight_set NUMERIC,
    catalogue_visibility BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sets
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sets
CREATE POLICY "Sets are viewable by everyone" 
ON public.sets 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert sets" 
ON public.sets 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sets" 
ON public.sets 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sets" 
ON public.sets 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates on sets
CREATE TRIGGER update_sets_updated_at
BEFORE UPDATE ON public.sets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add new columns to inventory table
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS set_id UUID,
ADD COLUMN IF NOT EXISTS shipping_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS being_used_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS returning_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS being_completed_count INTEGER NOT NULL DEFAULT 0;

-- Add foreign key constraint from inventory to sets
ALTER TABLE public.inventory
ADD CONSTRAINT inventory_set_id_fkey 
FOREIGN KEY (set_id) REFERENCES public.sets(id) ON DELETE CASCADE;

-- Add set_id column to wishlist table (replacing product_id logic)
ALTER TABLE public.wishlist 
ADD COLUMN IF NOT EXISTS set_id UUID;

-- Add foreign key constraint from wishlist to sets
ALTER TABLE public.wishlist
ADD CONSTRAINT wishlist_set_id_fkey 
FOREIGN KEY (set_id) REFERENCES public.sets(id) ON DELETE CASCADE;