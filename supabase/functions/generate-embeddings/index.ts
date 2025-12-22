import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { product_id } = await req.json();

        const { data: product, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', product_id)
            .single();

        if (productError || !product) throw new Error('Product not found');

        if (!OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY not set, skipping embedding generation');
            return new Response(JSON.stringify({ success: false, message: 'OpenAI key missing' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const textToEmbed = `${product.name} ${product.description || ''}`;

        const res = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                input: textToEmbed,
                model: 'text-embedding-3-small',
            }),
        });

        const responseData = await res.json();
        const embedding = responseData.data[0].embedding;

        const { error: embeddingError } = await supabase
            .from('product_embeddings' as any)
            .upsert({
                product_id: product.id,
                embedding: embedding,
            });

        if (embeddingError) throw embeddingError;

        return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
