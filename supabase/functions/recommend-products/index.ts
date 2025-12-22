import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { product_id, store_id, limit = 3 } = await req.json();

        // Get embedding for the reference product
        const { data: embeddingData, error: embError } = await supabase
            .from('product_embeddings' as any)
            .select('embedding')
            .eq('product_id', product_id)
            .single();

        if (embError || !embeddingData) {
            throw new Error('No embedding found for this product');
        }

        // Search for similar products
        const { data: recommendations, error: rpcError } = await supabase.rpc('match_products', {
            query_embedding: embeddingData.embedding,
            match_threshold: 0.5,
            match_count: limit,
            p_store_id: store_id
        });

        if (rpcError) throw rpcError;

        // Filter out the current product
        const filteredRecommendations = recommendations?.filter((r: any) => r.id !== product_id) || [];

        return new Response(
            JSON.stringify({ success: true, recommendations: filteredRecommendations }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
