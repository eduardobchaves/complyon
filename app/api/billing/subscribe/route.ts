import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession, getActiveEmployeeCount } from "@/lib/billing";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRole = (session.user as { role: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(userRole)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const companyId = (session.user as { companyId: string }).companyId;
  const email = session.user.email ?? "";

  try {
    const employeeCount = await getActiveEmployeeCount(companyId);
    const url = await createCheckoutSession(
      companyId,
      email,
      employeeCount,
      `${APP_URL}/billing?success=true`,
      `${APP_URL}/billing?canceled=true`
    );
    return NextResponse.json({ url });
  } catch (e) {
    console.error("[billing/subscribe]", e);
    return NextResponse.json({ error: "Erro ao criar sessão de pagamento" }, { status: 500 });
  }
}
