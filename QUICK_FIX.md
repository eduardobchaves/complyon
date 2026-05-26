# 🚀 Quick Fix for Login Issue (2 minutes)

## The Problem
Login is failing on Vercel because `NEXTAUTH_URL` environment variable isn't set to your production domain.

## The Solution

### 1️⃣ Go to Vercel
https://vercel.com/dashboard → Select **complyon** project

### 2️⃣ Set One Critical Variable
**Settings** → **Environment Variables**

Click **Add** and enter:
```
Name:  NEXTAUTH_URL
Value: https://www.complyon.com.br
Scope: Production (and Preview + Development)
```

Click **Save**

### 3️⃣ Redeploy
Go to **Deployments** → Click **Redeploy** on latest deployment

Wait for green checkmark ✅ (~2-3 min)

### 4️⃣ Test
Visit: https://www.complyon.com.br/login

Login with:
- **Email:** superadmin@complyon.com.br
- **Password:** ComplyOn@2024

Should see dashboard ✅

---

## Why?
- Your app was built for `http://localhost:3000`
- Production requests come from `https://www.complyon.com.br`
- CSRF token validation fails when domains don't match
- Setting `NEXTAUTH_URL=https://www.complyon.com.br` fixes it

## If You Need All Vars

Set these on Vercel for Production environment:

| Variable | Value |
|----------|-------|
| `NEXTAUTH_URL` | `https://www.complyon.com.br` |
| `NEXT_PUBLIC_APP_URL` | `https://www.complyon.com.br` |
| `AUTH_SECRET` | `minha-chave-super-secreta-para-safemind-2025` |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_GIW2m3ykrVLH@ep-orange-waterfall-apxs53yw.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `RESEND_API_KEY` | `re_a1kq7X4b_GJwXWQRj5VGXdZ2UbjEWvTkR` |
| `EMAIL_FROM` | `ComplyOn <noreply@complyon.com.br>` |
| `STRIPE_SECRET_KEY` | Your production Stripe key |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your production Stripe publishable key |

---

**Time needed:** 2-3 minutes ⏱️
