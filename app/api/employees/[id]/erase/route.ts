import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncCompanyUsage } from "@/lib/billing";

// LGPD Art. 18 — irreversible anonymisation of all personal data for one employee.
// Preserves the user record (for referential integrity with surveys/responses) but
// replaces every personal field with a neutral placeholder. Cannot be undone.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRole = (session.user as { role: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(userRole)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const companyId = (session.user as { companyId: string }).companyId;
  const { id } = await params;

  const employee = await prisma.user.findFirst({ where: { id, companyId } });
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (employee.role === "ADMIN" || employee.role === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Contas de administrador não podem ser apagadas por este endpoint" }, { status: 403 });
  }

  // Use a stable, unique placeholder so the unique email constraint is not violated
  await prisma.user.update({
    where: { id },
    data: {
      name: "Colaborador Removido",
      email: `apagado_${id}@removido.safemind`,
      password: null,
      active: false,
      inviteToken: null,
      invitedAt: null,
    },
  });

  await syncCompanyUsage(companyId).catch(() => {});
  return NextResponse.json({ ok: true });
}
