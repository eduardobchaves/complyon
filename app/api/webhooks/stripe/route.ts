import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Checkout completed — activate subscription and record item ID
      case "checkout.session.completed": {
        const cs = event.data.object as Stripe.Checkout.Session;
        if (cs.mode !== "subscription") break;

        const subId = cs.subscription as string;
        const sub = await stripe.subscriptions.retrieve(subId, { expand: ["items.data"] });
        const companyId = sub.metadata?.companyId;
        if (!companyId) break;

        const subItemId = sub.items.data[0]?.id;

        await prisma.company.update({
          where: { id: companyId },
          data: {
            plan: "STARTER",
            stripeSubId: subId,
            maxEmployees: -1,
          },
        });
        break;
      }

      // Subscription modified (e.g. reactivated after failed payment)
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const company = await prisma.company.findFirst({
          where: { stripeCustomerId: sub.customer as string },
        });
        if (!company) break;

        const subItemId = sub.items.data[0]?.id;
        const active = sub.status === "active" || sub.status === "trialing";

        await prisma.company.update({
          where: { id: company.id },
          data: {
            ...(active && { plan: "STARTER", maxEmployees: -1 }),
          },
        });
        break;
      }

      // Payment failed — suspend access until payment is resolved
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const company = await prisma.company.findFirst({
          where: { stripeCustomerId: invoice.customer as string },
        });
        if (company) {
          await prisma.company.update({ where: { id: company.id }, data: { plan: "FREE" } });
        }
        break;
      }

      // Payment succeeded (retry after failure) — restore access
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const company = await prisma.company.findFirst({
          where: { stripeCustomerId: invoice.customer as string },
        });
        if (company?.plan === "FREE") {
          await prisma.company.update({
            where: { id: company.id },
            data: { plan: "STARTER", maxEmployees: -1 },
          });
        }
        break;
      }

      // Subscription cancelled
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const company = await prisma.company.findFirst({
          where: { stripeCustomerId: sub.customer as string },
        });
        if (company) {
          await prisma.company.update({
            where: { id: company.id },
            data: { plan: "FREE", maxEmployees: 10, stripeSubId: null },
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
