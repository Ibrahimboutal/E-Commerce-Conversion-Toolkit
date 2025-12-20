# Phase 2 Deployment Guide

## Prerequisites

Before deploying, you need to set up the following external services:

### 1. Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Go to Dashboard → Developers → API Keys
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

### 2. Resend Account

1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys
3. Create a new API key
4. Copy the key (starts with `re_`)

### 3. Sentry Account (Optional but Recommended)

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project (React)
3. Copy the DSN (looks like `https://...@sentry.io/...`)

---

## Local Setup

### 1. Update Environment Variables

Add to your `.env` file:

```env
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Resend
VITE_RESEND_API_KEY=re_your_key_here

# Sentry (optional)
VITE_SENTRY_DSN=https://your_dsn@sentry.io/your_project_id
```

### 2. Set up Stripe Products

In your Stripe Dashboard:

1. Go to Products → Create product
2. Name: "Pro Plan"
3. Add pricing:
   - **Monthly**: $29/month
   - **Yearly**: $290/year (optional)
4. Copy the Price ID (starts with `price_`)
5. Update `src/lib/stripe.ts` with your price IDs

### 3. Install Supabase CLI

```bash
npm install -g supabase
```

### 4. Link to Your Supabase Project

```bash
supabase link --project-ref your-project-ref
```

### 5. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook  
supabase functions deploy send-email
```

### 6. Set Edge Function Secrets

```bash
# Stripe secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Resend secret
supabase secrets set RESEND_API_KEY=re_your_api_key
```

### 7. Apply Database Migrations

```bash
# Apply RLS policies and indexes
supabase db push
```

---

## Configure Stripe Webhooks

### 1. Get Webhook URL

Your webhook URL is:
```
https://your-project-ref.supabase.co/functions/v1/stripe-webhook
```

### 2. Add Webhook in Stripe

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Update the secret in Supabase:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret
   ```

### 3. Test Webhook Locally (Optional)

```bash
# Install Stripe CLI
# Windows (scoop)
scoop install stripe

# Mac (brew)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
```

---

## Testing

### 1. Test Stripe Payment

Use these test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

Any future expiry date and any CVC will work.

### 2. Test Email Sending

```bash
# In your app, trigger an abandoned cart email
# Or use Resend dashboard to send test emails
```

### 3. Test Sentry Errors

```javascript
// In your app console:
throw new Error('Test error for Sentry');
```

Check Sentry dashboard for the error.

---

## Production Deployment

### 1. Update Environment Variables

In your hosting platform (Vercel/Netlify):

1. Add production Stripe keys (use `pk_live_` and `sk_live_`)
2. Add production Resend API key
3. Add Sentry DSN
4. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

### 2. Deploy Edge Functions to Production

```bash
# Set production secrets
supabase --project-ref your-prod-ref secrets set STRIPE_SECRET_KEY=sk_live_your_live_key
supabase --project-ref your-prod-ref secrets set RESEND_API_KEY=re_your_prod_key

# Deploy functions
supabase functions deploy --project-ref your-prod-ref
```

### 3. Update Stripe Webhook

1. Create a new webhook endpoint in Stripe with your production URL
2. Update the webhook secret in Supabase production

### 4. Test in Production

- Complete a test purchase
- Verify subscription status updates
- Check RLS is working (try accessing another user's data)
- Monitor Sentry for errors

---

## Monitoring

### Check Function Logs

```bash
# Real-time logs
supabase functions logs create-checkout-session --follow

# Recent logs
supabase functions logs stripe-webhook
```

### Dashboard Links

- **Stripe**: [dashboard.stripe.com](https://dashboard.stripe.com)
- **Resend**: [resend.com/emails](https://resend.com/emails)
- **Sentry**: [sentry.io](https://sentry.io)
- **Supabase**: [supabase.com/dashboard](https://supabase.com/dashboard)

---

## Troubleshooting

### Webhook not working

- Check webhook secret matches in Stripe and Supabase
- Verify URL is correct
- Check function logs for errors
- Ensure Stripe has correct events selected

### Email not sending

- Check Resend API key is correct
- Verify domain is verified in Resend (for production)
- Check function logs
- Look at Resend dashboard for delivery status

### Sentry not capturing errors

- Verify DSN is correct
- Check environment (Sentry only initializes in production)
- Ensure errors are actually being thrown
- Check Sentry project settings

### Database RLS blocking queries

- Verify auth tokens are being passed correctly
- Check RLS policies in Supabase dashboard
- Use `supabase db dump` to inspect policies
- Temporarily disable RLS for debugging (not recommended for production)

---

## Cost Monitoring

- **Stripe**: 2.9% + $0.30 per transaction
- **Resend**: Free tier (100 emails/day), then $20/month
- **Sentry**: Free tier (5K errors/month), then $26/month
- **Supabase**: Free tier, then $25/month

Set up billing alerts in each service!
