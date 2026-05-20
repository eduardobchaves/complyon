import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSurveyTokenEmail } from "@/lib/resend";
import crypto from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function generateToken(): string {
  return crypto.randomBytes(20).toString("hex");
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = (session.user as { companyId: string }).companyId;
  const { id } = await params;

  const survey = await prisma.survey.findFirst({ where: { id, companyId } });
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const tokens = await prisma.surveyToken.findMany({
    where: { surveyId: id },
    orderBy: { createdAt: "asc" },
  });

  // Never expose emailSentTo to company admins
  return NextResponse.json(tokens.map(t => ({
    id: t.id,
    token: t.token,
    usedAt: t.usedAt,
    createdAt: t.createdAt,
    sentByEmail: !!t.emailSentTo,
  })));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = (session.user as { companyId: string }).companyId;
  const { id } = await params;
  const body = await req.json();

  const survey = await prisma.survey.findFirst({ where: { id, companyId } });
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { name: true } });

  // Mode 1: send to all active employees by email
  if (body.sendToEmployees) {
    if (survey.status !== "ACTIVE") {
      return NextResponse.json({ error: "A pesquisa precisa estar ativa para enviar os links por email" }, { status: 400 });
    }

    const employees = await prisma.user.findMany({
      where: { companyId, active: true, role: "EMPLOYEE" },
      select: { email: true },
    });

    if (employees.length === 0) {
      return NextResponse.json({ error: "Nenhum colaborador ativo encontrado" }, { status: 400 });
    }

    // Skip employees who already have a token for this survey
    const existing = await prisma.surveyToken.findMany({
      where: { surveyId: id, emailSentTo: { not: null } },
      select: { emailSentTo: true },
    });
    const alreadySent = new Set(existing.map(t => t.emailSentTo));
    const toSend = employees.filter(e => !alreadySent.has(e.email));

    if (toSend.length === 0) {
      return NextResponse.json({ error: "Todos os colaboradores já receberam o link desta pesquisa" }, { status: 400 });
    }

    const tokens = toSend.map(emp => ({
      surveyId: id,
      token: generateToken(),
      emailSentTo: emp.email,
    }));

    await prisma.surveyToken.createMany({ data: tokens });

    // Send emails and collect results
    const emailResults = await Promise.allSettled(
      tokens.map(t =>
        sendSurveyTokenEmail({
          to: t.emailSentTo,
          companyName: company?.name ?? "",
          surveyTitle: survey.title,
          surveyLink: `${APP_URL}/s/${t.token}`,
        })
      )
    );

    const failed = emailResults
      .map((r, i) => r.status === "rejected" ? { email: tokens[i].emailSentTo, reason: String((r as PromiseRejectedResult).reason) } : null)
      .filter(Boolean);

    if (failed.length > 0) {
      console.error("[tokens] Email sending failures:", JSON.stringify(failed, null, 2));
    }

    const all = await prisma.surveyToken.findMany({ where: { surveyId: id }, orderBy: { createdAt: "asc" } });
    return NextResponse.json({
      sent: toSend.length - failed.length,
      failed: failed.length,
      tokens: all.map(t => ({ id: t.id, token: t.token, usedAt: t.usedAt, createdAt: t.createdAt, sentByEmail: !!t.emailSentTo })),
    }, { status: 201 });
  }

  // Mode 2: generate N anonymous tokens (no email)
  const { count } = body;
  if (!count || count < 1 || count > 500) {
    return NextResponse.json({ error: "Número inválido (1–500)" }, { status: 400 });
  }

  const tokens = Array.from({ length: count }, () => ({
    surveyId: id,
    token: generateToken(),
  }));

  await prisma.surveyToken.createMany({ data: tokens });

  const all = await prisma.surveyToken.findMany({ where: { surveyId: id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(all.map(t => ({
    id: t.id,
    token: t.token,
    usedAt: t.usedAt,
    createdAt: t.createdAt,
    sentByEmail: !!t.emailSentTo,
  })), { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = (session.user as { companyId: string }).companyId;
  const { id } = await params;

  const survey = await prisma.survey.findFirst({ where: { id, companyId } });
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.surveyToken.deleteMany({ where: { surveyId: id, usedAt: null } });

  return NextResponse.json({ ok: true });
}
