import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPortalSession } from "@/lib/billing";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRole = (session.user as { role: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(userRole)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const companyId = (session.user as { companyId: string }).companyId;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { stripeCustomerId: true },
  });

  if (!company?.stripeCustomerId) {
    return NextResponse.json({ error: "Sem assinatura ativa" }, { status: 400 });
  }

  try {
    const url = await createPortalSession(company.stripeCustomerId, `${APP_URL}/billing`);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("[billing/portal]", e);
    return NextResponse.json({ error: "Erro ao abrir portal de cobrança" }, { status: 500 });
  }
}
