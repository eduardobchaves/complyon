import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAllSphereScores, calculateOverallScore } from "@/lib/scoring";
import { sendSurveyOpenEmail, sendSurveyClosedEmail } from "@/lib/resend";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = (session.user as { companyId: string }).companyId;
  const { id } = await params;

  const survey = await prisma.survey.findFirst({
    where: { id, companyId },
    include: {
      responses: true,
      actionPlans: true,
      _count: { select: { responses: true } },
    },
  });

  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allAnswers: Record<string, number>[] = survey.responses.map(r => {
    const ans = r.answers as Record<string, number>;
    return ans;
  });

  const aggregated: Record<string, number[]> = {};
  for (const ans of allAnswers) {
    for (const [key, value] of Object.entries(ans)) {
      if (!aggregated[key]) aggregated[key] = [];
      aggregated[key].push(value as number);
    }
  }

  const avgAnswers: Record<string, number> = {};
  for (const [key, values] of Object.entries(aggregated)) {
    avgAnswers[key] = values.reduce((a, b) => a + b, 0) / values.length;
  }

  const sphereScores = calculateAllSphereScores(avgAnswers);
  const overallScore = calculateOverallScore(sphereScores);

  const totalEmployees = await prisma.user.count({ where: { companyId, active: true } });

  return NextResponse.json({
    ...survey,
    totalResponses: survey._count.responses,
    totalInvited: totalEmployees,
    responseRate: totalEmployees > 0 ? Math.round((survey._count.responses / totalEmployees) * 100) : 0,
    sphereScores,
    overallScore,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRole = (session.user as { role: string }).role;
  if (!["ADMIN", "MANAGER", "SUPER_ADMIN"].includes(userRole)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const companyId = (session.user as { companyId: string }).companyId;
  const { id } = await params;
  const body = await req.json();

  const survey = await prisma.survey.findFirst({ where: { id, companyId } });
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.survey.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.startDate && { startDate: new Date(body.startDate) }),
      ...(body.endDate && { endDate: new Date(body.endDate) }),
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (body.status === "ACTIVE" && survey.status !== "ACTIVE") {
    const [employees, company] = await Promise.all([
      prisma.user.findMany({ where: { companyId, active: true }, select: { email: true, name: true } }),
      prisma.company.findUnique({ where: { id: companyId }, select: { name: true } }),
    ]);
    await Promise.allSettled(
      employees.map(emp =>
        sendSurveyOpenEmail({
          to: emp.email,
          companyName: company?.name ?? "",
          surveyLink: `${appUrl}/survey`,
        })
      )
    );
  }

  if (body.status === "CLOSED" && survey.status === "ACTIVE") {
    const [admins, company, responseCount, employeeCount] = await Promise.all([
      prisma.user.findMany({ where: { companyId, role: { in: ["ADMIN", "MANAGER"] }, active: true }, select: { email: true } }),
      prisma.company.findUnique({ where: { id: companyId }, select: { name: true } }),
      prisma.response.count({ where: { surveyId: id } }),
      prisma.user.count({ where: { companyId, active: true } }),
    ]);
    const responseRate = employeeCount > 0 ? Math.round((responseCount / employeeCount) * 100) : 0;
    await Promise.allSettled(
      admins.map(admin =>
        sendSurveyClosedEmail({
          to: admin.email,
          companyName: company?.name ?? "",
          responseRate,
          resultsLink: `${appUrl}/surveys/${id}`,
        })
      )
    );
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = (session.user as { companyId: string }).companyId;
  const { id } = await params;

  const survey = await prisma.survey.findFirst({ where: { id, companyId } });
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.survey.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
