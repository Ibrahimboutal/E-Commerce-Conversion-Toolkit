-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    clv_score FLOAT DEFAULT 0,
    predicted_segment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(store_id, email)
);

-- Enable RLS for customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stores can manage their own customers"
    ON customers
    FOR ALL
    TO authenticated
    USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- Create products table (for embeddings and recommendations)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    external_id TEXT, -- ID from Shopify/WooCommerce
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(store_id, external_id)
);

-- Enable RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stores can manage their own products"
    ON products
    FOR ALL
    TO authenticated
    USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- Create product_embeddings table
CREATE TABLE IF NOT EXISTS product_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    embedding vector(1536), -- Assuming OpenAI 1536-dim embeddings
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for product_embeddings
ALTER TABLE product_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stores can manage their own embeddings"
    ON product_embeddings
    FOR ALL
    TO authenticated
    USING (product_id IN (SELECT id FROM products p JOIN stores s ON p.store_id = s.id WHERE s.user_id = auth.uid()));
