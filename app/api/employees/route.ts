import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { syncCompanyUsage } from "@/lib/billing";

const createEmployeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["EMPLOYEE", "MANAGER", "ADMIN"]).default("EMPLOYEE"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyId = (session.user as { companyId: string }).companyId;

  const employees = await prisma.user.findMany({
    where: { companyId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      invitedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(employees);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userRole = (session.user as { role: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(userRole)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const companyId = (session.user as { companyId: string }).companyId;

  const body = await request.json();
  const parsed = createEmployeeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, email, role } = parsed.data;

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  const currentCount = await prisma.user.count({ where: { companyId, active: true } });

  if (company && company.maxEmployees > 0 && currentCount >= company.maxEmployees) {
    return NextResponse.json(
      { error: `Limite de ${company.maxEmployees} colaboradores atingido para o plano atual` },
      { status: 403 }
    );
  }

  const existing = await prisma.user.findFirst({ where: { email, companyId } });
  if (existing) {
    return NextResponse.json({ error: "Email já cadastrado nesta empresa" }, { status: 409 });
  }

  const tempPassword = crypto.randomBytes(16).toString("hex");
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  const employee = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      companyId,
      active: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  await syncCompanyUsage(companyId).catch(() => {});
  return NextResponse.json(employee, { status: 201 });
}
