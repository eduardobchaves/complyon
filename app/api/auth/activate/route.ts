import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const activateSchema = z.object({
  email: z.string().email(),
  firstCode: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = activateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { email, firstCode, password } = parsed.data;
  const company = await prisma.company.findUnique({ where: { firstCode } });

  if (!company) return NextResponse.json({ error: "Código de ativação inválido" }, { status: 400 });
  if (company.activated) return NextResponse.json({ error: "Esta empresa já foi ativada" }, { status: 409 });
  if (company.adminEmail && company.adminEmail.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Email não autorizado para este código" }, { status: 403 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.create({
      data: { email, name: email.split("@")[0], password: hashedPassword, role: "ADMIN", active: true, companyId: company.id },
    }),
    prisma.company.update({ where: { id: company.id }, data: { activated: true } }),
  ]);

  return NextResponse.json({ success: true }, { status: 201 });
}
