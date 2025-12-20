-- Row Level Security Policies for E-Commerce Conversion Toolkit
-- This migration adds RLS policies to ensure users can only access their own data

-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Stores table policies
-- Users can only read and update their own store
CREATE POLICY "Users can view their own store"
  ON stores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own store"
  ON stores FOR UPDATE
  USING (auth.uid() = user_id);

-- Abandoned carts table policies  
-- Users can only access carts for their store
CREATE POLICY "Users can view their store's carts"
  ON abandoned_carts FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert carts for their store"
  ON abandoned_carts FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their store's carts"
  ON abandoned_carts FOR UPDATE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their store's carts"
  ON abandoned_carts FOR DELETE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Cart items table policies
-- Users can only access items for carts belonging to their store
CREATE POLICY "Users can view cart items for their store"
  ON cart_items FOR SELECT
  USING (
    cart_id IN (
      SELECT id FROM abandoned_carts 
      WHERE store_id IN (
        SELECT id FROM stores WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert cart items for their store"
  ON cart_items FOR INSERT
  WITH CHECK (
    cart_id IN (
      SELECT id FROM abandoned_carts 
      WHERE store_id IN (
        SELECT id FROM stores WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update cart items for their store"
  ON cart_items FOR UPDATE
  USING (
    cart_id IN (
      SELECT id FROM abandoned_carts 
      WHERE store_id IN (
        SELECT id FROM stores WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete cart items for their store"
  ON cart_items FOR DELETE
  USING (
    cart_id IN (
      SELECT id FROM abandoned_carts 
      WHERE store_id IN (
        SELECT id FROM stores WHERE user_id = auth.uid()
      )
    )
  );

-- Reviews table policies
-- Users can only access reviews for their store
CREATE POLICY "Users can view their store's reviews"
  ON reviews FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reviews for their store"
  ON reviews FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their store's reviews"
  ON reviews FOR UPDATE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their store's reviews"
  ON reviews FOR DELETE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );
