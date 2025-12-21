import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    const { event_type, store_id, data } = payload;

    console.log('Received webhook:', { event_type, store_id });

    if (event_type === 'cart.abandoned') {
      const { customer_email, customer_name, cart_token, cart_url, total_price, currency, items } = data;

      const { data: cart, error: cartError } = await supabase
        .from('abandoned_carts')
        .insert({
          store_id,
          customer_email,
          customer_name,
          cart_token,
          cart_url,
          total_price,
          currency: currency || 'USD',
          abandoned_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (cartError) {
        throw new Error(`Failed to create cart: ${cartError.message}`);
      }

      if (items && items.length > 0) {
        const cartItems = items.map((item: any) => ({
          cart_id: cart.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          quantity: item.quantity,
          price: item.price,
        }));

        await supabase.from('cart_items').insert(cartItems);
      }

      return new Response(
        JSON.stringify({ success: true, cart_id: cart.id }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (event_type === 'review.created') {
      const { product_id, product_name, customer_name, rating, review_text } = data;

      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          store_id,
          product_id,
          product_name,
          customer_name,
          rating,
          review_text,
        })
        .select()
        .single();

      if (reviewError) {
        throw new Error(`Failed to create review: ${reviewError.message}`);
      }

      return new Response(
        JSON.stringify({ success: true, review_id: review.id }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown event type' }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});