import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncCompanyUsage } from "@/lib/billing";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = (session.user as { companyId: string }).companyId;
  const { id } = await params;
  const body = await req.json();

  const employee = await prisma.user.findFirst({ where: { id, companyId } });
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Prevent modifying other admins and block role escalation
  if (employee.role === "ADMIN" || employee.role === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Cannot modify admin accounts" }, { status: 403 });
  }
  const allowedRoles = ["EMPLOYEE", "MANAGER"];
  if (body.role && !allowedRoles.includes(body.role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.active !== undefined && { active: body.active }),
      ...(body.role && allowedRoles.includes(body.role) && { role: body.role }),
    },
  });

  if (body.active !== undefined) {
    await syncCompanyUsage(companyId).catch(() => {});
  }
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = (session.user as { companyId: string }).companyId;
  const { id } = await params;

  const employee = await prisma.user.findFirst({ where: { id, companyId } });
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.user.update({ where: { id }, data: { active: false } });
  await syncCompanyUsage(companyId).catch(() => {});
  return NextResponse.json({ ok: true });
}
