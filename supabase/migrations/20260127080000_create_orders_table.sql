-- Create orders table for tracking user order history
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    set_id UUID REFERENCES public.sets(id) ON DELETE SET NULL,
    
    -- Order details
    order_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    shipped_date TIMESTAMP WITH TIME ZONE,
    delivered_date TIMESTAMP WITH TIME ZONE,
    returned_date TIMESTAMP WITH TIME ZONE,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending',
    -- possible values: 'pending', 'shipped', 'delivered', 'in_use', 'returned', 'cancelled'
    
    -- Additional info
    tracking_number TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date DESC);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can only see their own orders
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can manage all orders
CREATE POLICY "Admins can manage all orders"
    ON public.orders FOR ALL
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Operadores can insert and update orders
CREATE POLICY "Operadores can manage orders"
    ON public.orders FOR INSERT
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role) OR 
        public.has_role(auth.uid(), 'operador'::public.app_role)
    );

CREATE POLICY "Operadores can update orders"
    ON public.orders FOR UPDATE
    USING (
        public.has_role(auth.uid(), 'admin'::public.app_role) OR 
        public.has_role(auth.uid(), 'operador'::public.app_role)
    );
