import Stripe from "stripe";

let stripe: Stripe | null = null;
let initialized = false;

export function getStripe(): Stripe | null {
  if (!initialized) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    // Only initialize if we have a real key (not placeholder)
    if (apiKey && !apiKey.includes("placeholder")) {
      try {
        stripe = new Stripe(apiKey, {
          apiVersion: "2026-04-22.dahlia",
        });
      } catch (error) {
        console.warn("Failed to initialize Stripe:", error);
        stripe = null;
      }
    }
    initialized = true;
  }
  return stripe;
}

