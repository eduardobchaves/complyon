import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function generateSlug(name: string): string {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}

const createSchema = z.object({
  name: z.string().min(2),
  cnpj: z.string().length(14),
  adminEmail: z.string().email(),
  firstCode: z.string().min(4).max(32),
  maxEmployees: z.number().int().min(1).default(20),
});

async function requireSuperAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "SUPER_ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, cnpj: true, adminEmail: true, firstCode: true, activated: true, maxEmployees: true, plan: true, createdAt: true, _count: { select: { users: true } } },
  });
  return NextResponse.json(companies);
}

export async function POST(request: NextRequest) {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { name, cnpj, adminEmail, firstCode, maxEmployees } = parsed.data;

  const [existingCnpj, existingCode] = await Promise.all([
    prisma.company.findUnique({ where: { cnpj } }),
    prisma.company.findUnique({ where: { firstCode } }),
  ]);

  if (existingCnpj) return NextResponse.json({ error: "CNPJ já cadastrado" }, { status: 409 });
  if (existingCode) return NextResponse.json({ error: "Código já utilizado" }, { status: 409 });

  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let suffix = 0;
  while (await prisma.company.findUnique({ where: { slug } })) { suffix++; slug = `${baseSlug}-${suffix}`; }

  const company = await prisma.company.create({ data: { name, cnpj, slug, adminEmail, firstCode, maxEmployees, plan: "FREE" } });
  return NextResponse.json(company, { status: 201 });
}
