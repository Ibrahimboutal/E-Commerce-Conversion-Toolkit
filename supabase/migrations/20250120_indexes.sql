-- Performance indexes for E-Commerce Conversion Toolkit
-- These indexes improve query performance for common operations

-- Abandoned carts indexes
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_store_id 
  ON abandoned_carts(store_id);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_abandoned_at 
  ON abandoned_carts(abandoned_at DESC);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_reminder_sent 
  ON abandoned_carts(reminder_sent) 
  WHERE NOT recovered;

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_recovered 
  ON abandoned_carts(recovered);

-- Cart items indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id 
  ON cart_items(cart_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_store_id 
  ON reviews(store_id);

CREATE INDEX IF NOT EXISTS idx_reviews_sentiment 
  ON reviews(sentiment) 
  WHERE analyzed = true;

CREATE INDEX IF NOT EXISTS idx_reviews_rating 
  ON reviews(rating);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at 
  ON reviews(created_at DESC);

-- Stores indexes
CREATE INDEX IF NOT EXISTS idx_stores_user_id 
  ON stores(user_id);

CREATE INDEX IF NOT EXISTS idx_stores_subscription_tier 
  ON stores(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_stores_subscription_status 
  ON stores(subscription_status);
