import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calculateAllSphereScores } from "@/lib/scoring";

const responseSchema = z.object({
  token: z.string(),
  surveyId: z.string(),
  answers: z.record(z.string(), z.number()),
  openText1: z.string().optional(),
  openText2: z.string().optional(),
  openText3: z.string().optional(),
  wantsSupport: z.boolean().optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  recommendation: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    const message = Object.entries(fields).map(([k, v]) => `${k}: ${v?.join(", ")}`).join("; ");
    return NextResponse.json({ error: message || "Dados inválidos" }, { status: 400 });
  }

  const { token, surveyId, answers, openText1, openText2, openText3, wantsSupport, stressLevel, recommendation } = parsed.data;

  // Validate token atomically — check it exists, unused, and matches the survey
  const tokenRecord = await prisma.surveyToken.findUnique({ where: { token } });
  if (!tokenRecord) return NextResponse.json({ error: "Token inválido" }, { status: 403 });
  if (tokenRecord.usedAt) return NextResponse.json({ error: "Token já utilizado" }, { status: 403 });
  if (tokenRecord.surveyId !== surveyId) return NextResponse.json({ error: "Token inválido para esta pesquisa" }, { status: 403 });

  const survey = await prisma.survey.findUnique({ where: { id: surveyId } });
  if (!survey) return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
  if (survey.status !== "ACTIVE") return NextResponse.json({ error: "Pesquisa não está ativa" }, { status: 400 });

  const now = new Date();
  if (survey.endDate && now > survey.endDate) {
    await prisma.survey.update({ where: { id: surveyId }, data: { status: "CLOSED" } });
    return NextResponse.json({ error: "Pesquisa encerrada" }, { status: 400 });
  }

  const sphereScores = calculateAllSphereScores(answers);
  const scoresMap: Record<string, number> = {};
  sphereScores.forEach(s => { scoresMap[s.sphereId] = s.score; });

  // Create response and mark token as used in a transaction
  await prisma.$transaction([
    prisma.response.create({
      data: {
        surveyId,
        answers: {
          ...answers,
          ...(openText1 && { openText1 }),
          ...(openText2 && { openText2 }),
          ...(openText3 && { openText3 }),
          ...(wantsSupport !== undefined && { wantsSupport }),
          ...(stressLevel !== undefined && { stressLevel }),
          ...(recommendation && { recommendation }),
        },
        scores: scoresMap,
      },
    }),
    prisma.surveyToken.update({
      where: { token },
      data: {
        usedAt: now,
        emailSentTo: null, // LGPD: remove email linkability once token is consumed
      },
    }),
  ]);

  return NextResponse.json({ ok: true }, { status: 201 });
}
