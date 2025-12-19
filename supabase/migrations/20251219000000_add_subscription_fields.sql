-- Add subscription columns to the stores table
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- Optional: Create an index for faster queries if you have many stores
CREATE INDEX IF NOT EXISTS idx_stores_subscription ON stores(subscription_tier);
