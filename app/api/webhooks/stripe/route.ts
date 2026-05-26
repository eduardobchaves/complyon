import { NextResponse } from "next/server";

// Stripe webhook is disabled — plans are managed manually.
// Re-enable by restoring the full handler when Stripe integration is reactivated.
export async function POST() {
  return NextResponse.json({ received: true });
}
