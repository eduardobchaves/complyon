import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function getAuthorizedSurvey(surveyId: string) {
  const session = await auth();
  if (!session?.user) return null;
  const companyId = (session.user as { companyId?: string }).companyId;
  if (!companyId) return null;
  return prisma.survey.findFirst({ where: { id: surveyId, companyId } });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const survey = await getAuthorizedSurvey(id);
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const tokens = await prisma.surveyToken.findMany({
    where: { surveyId: id },
    orderBy: { createdAt: "asc" },
  });

  const company = await prisma.company.findUnique({ where: { id: survey.companyId } });

  return NextResponse.json({ tokens, maxEmployees: company?.maxEmployees ?? 10 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const survey = await getAuthorizedSurvey(id);
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const company = await prisma.company.findUnique({ where: { id: survey.companyId } });
  const maxEmployees = company?.maxEmployees ?? 10;

  const existingCount = await prisma.surveyToken.count({ where: { surveyId: id } });
  const canGenerate = maxEmployees - existingCount;

  if (canGenerate <= 0) {
    return NextResponse.json(
      { error: `Limite de ${maxEmployees} links atingido para esta pesquisa.` },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const requested = typeof body.count === "number" ? body.count : canGenerate;
  const count = Math.min(requested, canGenerate);

  await prisma.surveyToken.createMany({
    data: Array.from({ length: count }, () => ({ token: generateToken(), surveyId: id })),
  });

  const tokens = await prisma.surveyToken.findMany({
    where: { surveyId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ tokens, maxEmployees }, { status: 201 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const survey = await getAuthorizedSurvey(id);
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.surveyToken.deleteMany({ where: { surveyId: id, used: false } });
  return NextResponse.json({ ok: true });
}
