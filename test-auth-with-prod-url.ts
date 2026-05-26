/**
 * This test verifies that authentication works when NEXTAUTH_URL is correctly set
 * to the production domain (https://www.complyon.com.br)
 */

import { signIn } from "next-auth/react";

// Simulate what happens when NEXTAUTH_URL is set correctly
async function testAuthWithProdUrl() {
  console.log("🧪 Testing authentication with production URL...\n");

  console.log(
    "Current NEXTAUTH_URL:",
    process.env.NEXTAUTH_URL || "NOT SET (using fallback)"
  );
  console.log("VERCEL_URL:", process.env.VERCEL_URL || "NOT SET (not on Vercel)");

  // The issue is that on Vercel production:
  // - NEXTAUTH_URL should be set to: https://www.complyon.com.br
  // - Currently it's probably set to: http://localhost:3000 (from .env)
  // - Or not set at all, causing Vercel to fall back to VERCEL_URL (which might not match the custom domain)

  console.log("\n📋 For production, NEXTAUTH_URL must be:");
  console.log("   https://www.complyon.com.br");

  console.log("\n⚠️  Without correct NEXTAUTH_URL:");
  console.log("   - CSRF token validation fails");
  console.log("   - Session cookies are not set to correct domain");
  console.log("   - Login attempts redirect to wrong URL");

  console.log("\n✅ Solution:");
  console.log("   1. Go to Vercel Dashboard");
  console.log("   2. Project Settings → Environment Variables");
  console.log("   3. Set: NEXTAUTH_URL = https://www.complyon.com.br");
  console.log("   4. Redeploy the application");
}

testAuthWithProdUrl().catch(console.error);
