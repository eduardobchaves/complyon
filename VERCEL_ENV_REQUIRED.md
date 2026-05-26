# Required Environment Variables for Vercel Production

The following environment variables MUST be set on Vercel for the application to work correctly:

## Critical for Authentication

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXTAUTH_URL` | `https://www.complyon.com.br` | **CRITICAL** - Must match your production domain |
| `AUTH_SECRET` | `minha-chave-super-secreta-para-safemind-2025` | Secret key for signing JWT tokens |

## Database

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_GIW2m3ykrVLH@ep-orange-waterfall-apxs53yw.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require` | Your Neon PostgreSQL connection string |

## Email Service (Resend)

| Variable | Value | Notes |
|----------|-------|-------|
| `RESEND_API_KEY` | `re_a1kq7X4b_GJwXWQRj5VGXdZ2UbjEWvTkR` | API key from Resend |
| `EMAIL_FROM` | `ComplyOn <noreply@complyon.com.br>` | From address for emails |
| `NEXT_PUBLIC_APP_URL` | `https://www.complyon.com.br` | Public app URL for links in emails |

## Payment Processing (Stripe)

| Variable | Value | Notes |
|----------|-------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | **Use PRODUCTION key**, not sk_test_ |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Webhook signing secret from Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | **Use PRODUCTION key**, not pk_test_ |

## How to Set These on Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project (complyon)
3. Go to **Settings** → **Environment Variables**
4. For each variable above, click **Add** and enter:
   - **Name**: (the variable name)
   - **Value**: (the value from above)
   - **Environments**: Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application for changes to take effect

## Current Issue

The authentication is failing because `NEXTAUTH_URL` is likely not set to the production domain on Vercel. This causes NextAuth to use the wrong base URL for authentication callbacks.

**Solution**: Set `NEXTAUTH_URL=https://www.complyon.com.br` on Vercel and redeploy.

## Verification

After setting environment variables, verify by:
1. Visiting https://www.complyon.com.br
2. Attempting to login with superadmin@complyon.com.br / ComplyOn@2024
3. Should see successful redirect to /dashboard
