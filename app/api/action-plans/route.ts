import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  surveyId: z.string(),
  sphereId: z.string(),
  title: z.string(),
  description: z.string(),
  riskLevel: z.enum(["LOW", "MODERATE", "HIGH"]),
  responsible: z.string().optional(),
  deadline: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyId = (session.user as { companyId: string }).companyId;
  const { searchParams } = new URL(request.url);
  const surveyId = searchParams.get("surveyId");

  const plans = await prisma.actionPlan.findMany({
    where: {
      companyId,
      ...(surveyId && { surveyId }),
    },
    orderBy: [
      { riskLevel: "asc" },
      { createdAt: "asc" },
    ],
  });

  return NextResponse.json(plans);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userRole = (session.user as { role: string }).role;
  if (!["ADMIN", "MANAGER", "SUPER_ADMIN"].includes(userRole)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const companyId = (session.user as { companyId: string }).companyId;
  const body = await request.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { surveyId, sphereId, title, description, riskLevel, responsible, deadline } = parsed.data;

  const survey = await prisma.survey.findFirst({ where: { id: surveyId, companyId } });
  if (!survey) return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });

  const plan = await prisma.actionPlan.create({
    data: {
      surveyId,
      companyId,
      sphereId,
      title,
      description,
      riskLevel,
      status: "PENDING",
      responsible: responsible || null,
      deadline: deadline ? new Date(deadline) : null,
    },
  });

  return NextResponse.json(plan, { status: 201 });
}
