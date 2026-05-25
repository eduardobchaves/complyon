import "server-only";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Tier data kept private here — only used for the Stripe price creation mapping below.
const BILLING_TIERS = [
  { upTo: 10,       unitCents: 1200 },
  { upTo: 20,       unitCents: 1080 },
  { upTo: 30,       unitCents:  972 },
  { upTo: 40,       unitCents:  875 },
  { upTo: 50,       unitCents:  787 },
  { upTo: 60,       unitCents:  709 },
  { upTo: 70,       unitCents:  638 },
  { upTo: 80,       unitCents:  574 },
  { upTo: 90,       unitCents:  517 },
  { upTo: 100,      unitCents:  465 },
  { upTo: 120,      unitCents:  418 },
  { upTo: 150,      unitCents:  377 },
  { upTo: Infinity, unitCents:  339 },
] as const;

/** Number of active billable users (EMPLOYEE + MANAGER, not ADMIN). */
export async function getActiveEmployeeCount(companyId: string): Promise<number> {
  return prisma.user.count({
    where: { companyId, active: true, role: { in: ["EMPLOYEE", "MANAGER"] } },
  });
}

/**
 * Update the subscription item quantity to reflect the current employee count.
 * proration_behavior=none means the change takes effect on the next billing cycle.
 */
export async function syncCompanyUsage(companyId: string): Promise<void> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { stripeSubId: true },
  });
  if (!company?.stripeSubId) return;

  try {
    const subscription = await stripe.subscriptions.retrieve(company.stripeSubId);
    const subItemId = subscription.items.data[0]?.id;
    if (!subItemId) return;

    const count = await getActiveEmployeeCount(companyId);
    await stripe.subscriptionItems.update(subItemId, {
      quantity: count,
      proration_behavior: "none",
    });
  } catch (err) {
    console.error("[billing] usage sync failed:", err);
  }
}

/** Create (or retrieve) the Stripe tiered graduated price in BRL. */
export async function getOrCreateTieredPriceId(): Promise<string> {
  if (process.env.STRIPE_METERED_PRICE_ID) return process.env.STRIPE_METERED_PRICE_ID;

  const price = await stripe.prices.create({
    currency: "brl",
    billing_scheme: "tiered",
    tiers_mode: "graduated",
    recurring: { interval: "month", usage_type: "licensed" },
    tiers: BILLING_TIERS.map(t => ({
      up_to: t.upTo === Infinity ? ("inf" as const) : t.upTo,
      unit_amount: t.unitCents,
    })),
    product_data: { name: "ComplyOn — por colaborador" },
  });

  console.log(`[billing] Created Stripe tiered price. Add to .env: STRIPE_METERED_PRICE_ID=${price.id}`);
  return price.id;
}

/** Create Stripe Checkout Session for a new subscription (7-day free trial). */
export async function createCheckoutSession(
  companyId: string,
  companyEmail: string,
  employeeCount: number,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const priceId = await getOrCreateTieredPriceId();

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { stripeCustomerId: true, name: true },
  });

  let customerId = company?.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: companyEmail,
      name: company?.name,
      metadata: { companyId },
    });
    customerId = customer.id;
    await prisma.company.update({ where: { id: companyId }, data: { stripeCustomerId: customerId } });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: Math.max(1, employeeCount) }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: { metadata: { companyId }, trial_period_days: 7 },
  });

  return session.url!;
}

/** Create Stripe Billing Portal session so the admin can manage their subscription. */
export async function createPortalSession(customerId: string, returnUrl: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}
