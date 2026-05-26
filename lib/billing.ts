import "server-only";
import { prisma } from "@/lib/prisma";

// Billing via Stripe is disabled — plans are managed manually.
// Re-enable by restoring the full implementation when Stripe is reactivated.

export async function getActiveEmployeeCount(companyId: string): Promise<number> {
  return prisma.user.count({
    where: { companyId, active: true, role: { in: ["EMPLOYEE", "MANAGER"] } },
  });
}


export async function syncCompanyUsage(_companyId: string): Promise<void> {
  // no-op
}

export async function createCheckoutSession(
  _companyId: string,
  _companyEmail: string,
  _employeeCount: number,
  _successUrl: string,
  _cancelUrl: string
): Promise<string> {
  throw new Error("Stripe billing is not enabled.");
}

export async function createPortalSession(
  _customerId: string,
  _returnUrl: string
): Promise<string> {
  throw new Error("Stripe billing is not enabled.");
}
