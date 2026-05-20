// Pure pricing utilities — no Node.js dependencies, safe to import from client components.

export const BILLING_TIERS: ReadonlyArray<{ upTo: number; unitCents: number }> = [
  { upTo: 10,       unitCents: 1200 }, // R$12.00
  { upTo: 20,       unitCents: 1080 }, // R$10.80
  { upTo: 30,       unitCents:  972 }, // R$ 9.72
  { upTo: 40,       unitCents:  875 }, // R$ 8.75
  { upTo: 50,       unitCents:  787 }, // R$ 7.87
  { upTo: 60,       unitCents:  709 }, // R$ 7.09
  { upTo: 70,       unitCents:  638 }, // R$ 6.38
  { upTo: 80,       unitCents:  574 }, // R$ 5.74
  { upTo: 90,       unitCents:  517 }, // R$ 5.17
  { upTo: 100,      unitCents:  465 }, // R$ 4.65
  { upTo: 120,      unitCents:  418 }, // R$ 4.18
  { upTo: 150,      unitCents:  377 }, // R$ 3.77
  { upTo: Infinity, unitCents:  339 }, // R$ 3.39
];

/** Total monthly cost in BRL cents for a given employee count (graduated tiers). */
export function calculateMonthlyBilling(count: number): number {
  let remaining = count;
  let total = 0;
  let prev = 0;
  for (const tier of BILLING_TIERS) {
    if (remaining <= 0) break;
    const tierMax = tier.upTo === Infinity ? remaining : tier.upTo;
    const inTier = Math.min(remaining, tierMax - prev);
    total += inTier * tier.unitCents;
    remaining -= inTier;
    prev = tier.upTo === Infinity ? prev : tier.upTo;
  }
  return total;
}

export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
