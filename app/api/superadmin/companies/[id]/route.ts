import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  cnpj: z.string().length(14).optional(),
  adminEmail: z.string().email().optional(),
  firstCode: z.string().min(4).max(32).optional(),
  maxEmployees: z.number().int().min(1).optional(),
});

async function requireSuperAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "SUPER_ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

  const data = parsed.data;

  if (data.cnpj && data.cnpj !== company.cnpj) {
    const existing = await prisma.company.findUnique({ where: { cnpj: data.cnpj } });
    if (existing) return NextResponse.json({ error: "CNPJ já cadastrado" }, { status: 409 });
  }

  if (data.firstCode && data.firstCode !== company.firstCode) {
    const existing = await prisma.company.findFirst({ where: { firstCode: data.firstCode } });
    if (existing) return NextResponse.json({ error: "Código já utilizado" }, { status: 409 });
  }

  const updated = await prisma.company.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
