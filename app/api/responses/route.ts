import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calculateAllSphereScores } from "@/lib/scoring";

const responseSchema = z.object({
  surveyId: z.string(),
  answers: z.record(z.string(), z.number()),
  openText1: z.string().optional(),
  openText2: z.string().optional(),
  openText3: z.string().optional(),
  wantsSupport: z.boolean().optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  recommendation: z.string().optional(),
  token: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { surveyId, answers, openText1, openText2, openText3, wantsSupport, stressLevel, recommendation, token } = parsed.data;

  const survey = await prisma.survey.findUnique({ where: { id: surveyId } });
  if (!survey) return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
  if (survey.status !== "ACTIVE") return NextResponse.json({ error: "Pesquisa não está ativa" }, { status: 400 });

  const now = new Date();
  if (survey.endDate && now > survey.endDate) {
    await prisma.survey.update({ where: { id: surveyId }, data: { status: "CLOSED" } });
    return NextResponse.json({ error: "Pesquisa encerrada" }, { status: 400 });
  }

  // Validate token if provided
  let surveyToken = null;
  if (token) {
    surveyToken = await prisma.surveyToken.findUnique({ where: { token } });
    if (!surveyToken || surveyToken.surveyId !== surveyId) {
      return NextResponse.json({ error: "Link inválido" }, { status: 400 });
    }
    if (surveyToken.used) {
      return NextResponse.json({ error: "Este link já foi utilizado" }, { status: 400 });
    }
  }

  const sphereScores = calculateAllSphereScores(answers);
  const scoresMap: Record<string, number> = {};
  sphereScores.forEach(s => { scoresMap[s.sphereId] = s.score; });

  // IMPORTANT: We intentionally do NOT store any user ID or identifying information
  if (surveyToken) {
    await prisma.surveyToken.update({
      where: { id: surveyToken.id },
      data: { used: true, usedAt: new Date() },
    });
  }

  await prisma.response.create({
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
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
