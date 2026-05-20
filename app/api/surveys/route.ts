import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSurveySchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyId = (session.user as { companyId: string }).companyId;

  const surveys = await prisma.survey.findMany({
    where: { companyId },
    include: {
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const surveysWithStats = await Promise.all(
    surveys.map(async (survey) => {
      const totalEmployees = await prisma.user.count({
        where: { companyId, active: true },
      });

      return {
        ...survey,
        totalResponses: survey._count.responses,
        totalInvited: totalEmployees,
        responseRate:
          totalEmployees > 0
            ? Math.round((survey._count.responses / totalEmployees) * 100)
            : 0,
      };
    })
  );

  return NextResponse.json(surveysWithStats);
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
  const parsed = createSurveySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { title, description, startDate, endDate } = parsed.data;

  const survey = await prisma.survey.create({
    data: {
      title,
      description,
      companyId,
      status: "DRAFT",
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return NextResponse.json(survey, { status: 201 });
}
