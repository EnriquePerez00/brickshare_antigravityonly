-- Create set_piece_list table
CREATE TABLE public.set_piece_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_id UUID REFERENCES public.sets(id) ON DELETE CASCADE NOT NULL,
    lego_ref TEXT NOT NULL,
    piece_ref TEXT NOT NULL,
    color_ref TEXT,
    piece_description TEXT,
    piece_qty INTEGER DEFAULT 1 NOT NULL,
    piece_weight INTEGER, -- Weight in milligrams
    piece_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.set_piece_list ENABLE ROW LEVEL SECURITY;

-- Policies (Public read, Admin manage)
CREATE POLICY "Set piece lists are viewable by everyone"
ON public.set_piece_list FOR SELECT
USING (true);

CREATE POLICY "Admins can manage set piece lists"
ON public.set_piece_list FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_set_piece_list_updated_at
    BEFORE UPDATE ON public.set_piece_list
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_set_piece_list_set_id ON public.set_piece_list(set_id);
CREATE INDEX idx_set_piece_list_lego_ref ON public.set_piece_list(lego_ref);
