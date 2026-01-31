-- Create SHIPPING_ORDERS table

CREATE TABLE IF NOT EXISTS public.shipping_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    set_id UUID NOT NULL REFERENCES public.sets(id) ON DELETE CASCADE,
    shipping_order_date TIMESTAMPTZ DEFAULT now(),
    tracking_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_orders ENABLE ROW LEVEL SECURITY;

-- Add basic policy (Authenticated users can read their own orders)
CREATE POLICY "Users can view their own shipping orders"
    ON public.shipping_orders
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_shipping_orders_updated
    BEFORE UPDATE ON public.shipping_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.shipping_orders IS 'Tracks shipping orders with external carriers';
