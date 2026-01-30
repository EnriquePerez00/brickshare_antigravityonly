-- Enable RLS on wishlist table
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can add to their own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can remove from their own wishlist" ON wishlist;

-- Policy: Users can view their own wishlist items
CREATE POLICY "Users can view their own wishlist"
ON wishlist
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can add items to their own wishlist
CREATE POLICY "Users can add to their own wishlist"
ON wishlist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove items from their own wishlist
CREATE POLICY "Users can remove from their own wishlist"
ON wishlist
FOR DELETE
USING (auth.uid() = user_id);
