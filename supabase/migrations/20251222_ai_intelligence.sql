-- 1️⃣ Stores table
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL
);

-- 2️⃣ Customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    clv_score FLOAT DEFAULT 0,
    predicted_segment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(store_id, email)
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stores can manage their own customers"
ON public.customers
FOR ALL
TO authenticated
USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

-- 3️⃣ Products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    external_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(store_id, external_id)
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stores can manage their own products"
ON public.products
FOR ALL
TO authenticated
USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

-- 4️⃣ Product embeddings table
CREATE TABLE IF NOT EXISTS public.product_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    embedding extensions.vector(1536),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.product_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stores can manage their own embeddings"
ON public.product_embeddings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    JOIN public.stores s ON p.store_id = s.id
    WHERE p.id = product_embeddings.product_id
      AND s.user_id = auth.uid()
  )
);
