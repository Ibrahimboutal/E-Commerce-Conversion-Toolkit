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

    const { cart_id } = await req.json();

    const { data: cart, error: cartError } = await supabase
      .from('abandoned_carts')
      .select('*, cart_items(*)')
      .eq('id', cart_id)
      .single();

    if (cartError || !cart) {
      throw new Error('Cart not found');
    }

    const emailSubject = `Don't forget your items!`;
    const emailBody = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #059669;">You left some items in your cart</h2>
          <p>Hi ${cart.customer_name || 'there'},</p>
          <p>We noticed you left some items in your cart. Complete your purchase now!</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Cart:</h3>
            ${cart.cart_items?.map((item: any) => `
              <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                <strong>${item.product_name}</strong><br/>
                Quantity: ${item.quantity} - $${item.price}
              </div>
            `).join('')}
            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #e5e7eb;">
              <strong>Total: $${cart.total_price}</strong>
            </div>
          </div>
          
          ${cart.cart_url ? `
            <a href="${cart.cart_url}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">Complete Your Purchase</a>
          ` : ''}
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This cart will expire soon. Complete your order to secure these items.</p>
        </body>
      </html>
    `;

    console.log(`Sending cart reminder email to: ${cart.customer_email}`);
    console.log('Email would contain:', { subject: emailSubject, preview: emailBody.substring(0, 100) });

    await supabase
      .from('abandoned_carts')
      .update({
        reminder_sent: true,
        reminder_sent_at: new Date().toISOString(),
      })
      .eq('id', cart_id);

    await supabase
      .from('email_logs')
      .insert({
        cart_id: cart_id,
        email: cart.customer_email,
        subject: emailSubject,
        sent_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({ success: true, message: 'Cart reminder sent' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending cart reminder:', error);
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