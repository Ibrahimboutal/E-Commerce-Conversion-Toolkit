-- Function to match products based on vector similarity
CREATE OR REPLACE FUNCTION match_products (
  query_embedding vector(1536),
  match_threshold FLOAT,
  match_count INT,
  p_store_id UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  image_url TEXT,
  price DECIMAL,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.description,
    p.image_url,
    p.price,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM products p
  JOIN product_embeddings pe ON p.id = pe.product_id
  WHERE p.store_id = p_store_id
  AND 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
