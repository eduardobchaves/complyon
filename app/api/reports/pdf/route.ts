import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "results";
  const surveyId = searchParams.get("surveyId");
  const companyId = (session.user as { companyId: string }).companyId;

  // For now, return a simple JSON response with the data
  // In production, this would generate a PDF using @react-pdf/renderer
  try {
    if (type === "results" && surveyId) {
      const survey = await prisma.survey.findFirst({
        where: { id: surveyId, companyId },
        include: { responses: true, actionPlans: true },
      });

      if (!survey) {
        return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
      }

      const company = await prisma.company.findUnique({ where: { id: companyId } });

      // Return PDF generation placeholder
      return NextResponse.json({
        message: "PDF generation endpoint",
        data: {
          company: company?.name,
          survey: survey.title,
          responses: survey.responses.length,
          type,
        },
      });
    }

    if (type === "compliance") {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      return NextResponse.json({
        message: "Compliance PDF endpoint",
        company: company?.name,
      });
    }

    return NextResponse.json({ error: "Tipo de relatório inválido" }, { status: 400 });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
