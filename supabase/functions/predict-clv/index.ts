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

        const { customer_email, store_id } = await req.json();

        // Fetch recovered carts for this customer
        const { data: orders } = await supabase
            .from('abandoned_carts')
            .select('total_price, created_at')
            .eq('store_id', store_id)
            .eq('customer_email', customer_email)
            .eq('recovered', true);

        const totalSpent = orders?.reduce((acc, order) => acc + Number(order.total_price), 0) || 0;
        const orderCount = orders?.length || 0;
        const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;

        // Simple heuristic for CLV
        // Recency (days since last order)
        const lastOrder = orders?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        const daysSinceLastOrder = lastOrder
            ? Math.floor((new Date().getTime() - new Date(lastOrder.created_at).getTime()) / (1000 * 3600 * 24))
            : 999;

        let segment = 'Regular';
        if (totalSpent > 1000 || orderCount > 5) {
            segment = 'VIP';
        } else if (daysSinceLastOrder > 60) {
            segment = 'At Risk';
        }

        // Update customer table
        const { data: customer, error: upsertError } = await supabase
            .from('customers')
            .upsert({
                store_id,
                email: customer_email,
                clv_score: totalSpent * (orderCount / (daysSinceLastOrder + 1)), // Simple growth formula
                predicted_segment: segment,
                updated_at: new Date().toISOString()
            }, { onConflict: 'store_id,email' })
            .select()
            .single();

        if (upsertError) throw upsertError;

        return new Response(
            JSON.stringify({ success: true, customer }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
