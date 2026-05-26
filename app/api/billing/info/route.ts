import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getActiveEmployeeCount } from "@/lib/billing";
import { calculateMonthlyBilling } from "@/lib/billing-utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = (session.user as { companyId: string }).companyId;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { plan: true, stripeCustomerId: true, stripeSubId: true },
  });

  const employeeCount = await getActiveEmployeeCount(companyId);
  const estimatedCents = calculateMonthlyBilling(employeeCount);

  // Check if currently in trial period
  let trialEndsAt: string | null = null;
  if (company?.stripeSubId) {
    try {
      const sub = await getStripe().subscriptions.retrieve(company.stripeSubId);
      if (sub.status === "trialing" && sub.trial_end) {
        trialEndsAt = new Date(sub.trial_end * 1000).toISOString();
      }
    } catch {}
  }

  return NextResponse.json({
    plan: company?.plan ?? "FREE",
    employeeCount,
    estimatedCents,
    hasCustomer: !!company?.stripeCustomerId,
    trialEndsAt,
  });
}
