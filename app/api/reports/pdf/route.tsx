import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import {
  calculateAllSphereScores,
  calculateOverallScore,
} from "@/lib/scoring";

function riskColor(level: string) {
  if (level === "HIGH") return "#EF4444";
  if (level === "MODERATE") return "#F59E0B";
  return "#10B981";
}

function riskLabel(level: string) {
  if (level === "HIGH") return "Alto Risco";
  if (level === "MODERATE") return "Risco Moderado";
  return "Baixo Risco";
}

function statusLabel(s: string) {
  const m: Record<string, string> = {
    PENDING: "Pendente",
    IN_PROGRESS: "Em Andamento",
    COMPLETED: "Concluído",
    CANCELLED: "Cancelado",
  };
  return m[s] ?? s;
}

function fmtDate(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

const PURPLE = "#7C3AED";
const DARK = "#111827";
const MUTED = "#6B7280";
const LIGHT = "#F3F4F6";
const WHITE = "#FFFFFF";

const s = StyleSheet.create({
  page: {
    backgroundColor: WHITE,
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: DARK,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 28,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: PURPLE,
  },
  brand: { fontSize: 16, fontFamily: "Helvetica-Bold", color: PURPLE },
  headerMeta: { alignItems: "flex-end" },
  headerSub: { fontSize: 8, color: MUTED },
  reportType: {
    fontSize: 8,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    marginBottom: 3,
  },
  subtitle: { fontSize: 11, color: MUTED, marginBottom: 24 },
  metricsRow: { flexDirection: "row", marginBottom: 28 },
  metricBox: {
    flex: 1,
    backgroundColor: LIGHT,
    padding: 12,
    marginRight: 8,
    borderTopWidth: 3,
  },
  metricLabel: {
    fontSize: 7,
    color: MUTED,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  metricValue: { fontSize: 20, fontFamily: "Helvetica-Bold", color: DARK },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: DARK,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: PURPLE,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableHeadCell: { fontSize: 8, fontFamily: "Helvetica-Bold", color: WHITE },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: LIGHT,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  cell: { fontSize: 9, color: DARK },
  badge: { paddingHorizontal: 5, paddingVertical: 2 },
  badgeText: { fontSize: 7, fontFamily: "Helvetica-Bold" },
  planCard: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: LIGHT,
    borderLeftWidth: 3,
  },
  planTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    marginBottom: 4,
  },
  planDesc: { fontSize: 8, color: MUTED, marginBottom: 6, lineHeight: 1.5 },
  planMeta: { flexDirection: "row" },
  planMetaText: { fontSize: 7, color: MUTED, marginRight: 14 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerText: { fontSize: 7, color: MUTED },
  riskGroupLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    marginTop: 4,
  },
});

interface SphereScore {
  sphereId: string;
  sphereName: string;
  score: number;
  riskLevel: string;
}

function ResultsPDF({
  companyName,
  surveyTitle,
  totalResponses,
  totalEmployees,
  overallScore,
  sphereScores,
  generatedAt,
}: {
  companyName: string;
  surveyTitle: string;
  totalResponses: number;
  totalEmployees: number;
  overallScore: number;
  sphereScores: SphereScore[];
  generatedAt: string;
}) {
  const responseRate =
    totalEmployees > 0
      ? Math.round((totalResponses / totalEmployees) * 100)
      : 0;
  const scoreColor = riskColor(
    overallScore >= 7 ? "LOW" : overallScore >= 5 ? "MODERATE" : "HIGH"
  );

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.brand}>ComplyOn</Text>
          <View style={s.headerMeta}>
            <Text style={s.headerSub}>{companyName}</Text>
            <Text style={s.headerSub}>Gerado em {generatedAt}</Text>
          </View>
        </View>

        <Text style={s.reportType}>Relatório NR-01 — Resultado da Pesquisa</Text>
        <Text style={s.title}>{surveyTitle}</Text>
        <Text style={s.subtitle}>{companyName}</Text>

        <View style={s.metricsRow}>
          <View style={[s.metricBox, { borderTopColor: scoreColor }]}>
            <Text style={s.metricLabel}>Score Geral</Text>
            <Text style={[s.metricValue, { color: scoreColor }]}>
              {overallScore.toFixed(1)}
            </Text>
          </View>
          <View style={[s.metricBox, { borderTopColor: "#6366F1" }]}>
            <Text style={s.metricLabel}>Respostas</Text>
            <Text style={s.metricValue}>{totalResponses}</Text>
          </View>
          <View style={[s.metricBox, { borderTopColor: "#8B5CF6", marginRight: 0 }]}>
            <Text style={s.metricLabel}>Participação</Text>
            <Text style={s.metricValue}>{responseRate}%</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Score por Esfera</Text>
        <View style={s.tableHead}>
          <Text style={[s.tableHeadCell, { flex: 3 }]}>Esfera</Text>
          <Text style={[s.tableHeadCell, { flex: 1, textAlign: "center" }]}>Score</Text>
          <Text style={[s.tableHeadCell, { flex: 2, textAlign: "right" }]}>Nível de Risco</Text>
        </View>
        {sphereScores.map((sphere, i) => (
          <View key={sphere.sphereId} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.cell, { flex: 3 }]}>{sphere.sphereName}</Text>
            <Text
              style={[
                s.cell,
                {
                  flex: 1,
                  textAlign: "center",
                  fontFamily: "Helvetica-Bold",
                  color: riskColor(sphere.riskLevel),
                },
              ]}
            >
              {sphere.score.toFixed(1)}
            </Text>
            <View style={{ flex: 2, alignItems: "flex-end" }}>
              <View style={[s.badge, { backgroundColor: riskColor(sphere.riskLevel) + "22" }]}>
                <Text style={[s.badgeText, { color: riskColor(sphere.riskLevel) }]}>
                  {riskLabel(sphere.riskLevel)}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>ComplyOn — Gestão de Saúde Mental NR-01</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

interface ActionPlan {
  id: string;
  sphereId: string;
  title: string;
  description: string;
  riskLevel: string;
  status: string;
  responsible: string | null;
  deadline: Date | string | null;
  notes: string | null;
}

function ActionPlanPDF({
  companyName,
  surveyTitle,
  actionPlans,
  generatedAt,
}: {
  companyName: string;
  surveyTitle: string;
  actionPlans: ActionPlan[];
  generatedAt: string;
}) {
  const groups = {
    HIGH: actionPlans.filter((p) => p.riskLevel === "HIGH"),
    MODERATE: actionPlans.filter((p) => p.riskLevel === "MODERATE"),
    LOW: actionPlans.filter((p) => p.riskLevel === "LOW"),
  };
  const groupMeta = {
    HIGH: { label: "Alto Risco", color: "#EF4444" },
    MODERATE: { label: "Risco Moderado", color: "#F59E0B" },
    LOW: { label: "Baixo Risco", color: "#10B981" },
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.brand}>ComplyOn</Text>
          <View style={s.headerMeta}>
            <Text style={s.headerSub}>{companyName}</Text>
            <Text style={s.headerSub}>Gerado em {generatedAt}</Text>
          </View>
        </View>

        <Text style={s.reportType}>Plano de Ação NR-01</Text>
        <Text style={s.title}>{surveyTitle}</Text>
        <Text style={s.subtitle}>{companyName}</Text>

        {(["HIGH", "MODERATE", "LOW"] as const).map((risk) => {
          const plans = groups[risk];
          if (plans.length === 0) return null;
          const meta = groupMeta[risk];
          return (
            <View key={risk}>
              <Text style={[s.riskGroupLabel, { color: meta.color }]}>
                {meta.label} ({plans.length})
              </Text>
              {plans.map((plan) => (
                <View key={plan.id} style={[s.planCard, { borderLeftColor: meta.color }]}>
                  <Text style={s.planTitle}>{plan.title}</Text>
                  <Text style={s.planDesc}>{plan.description}</Text>
                  <View style={s.planMeta}>
                    <Text style={s.planMetaText}>Status: {statusLabel(plan.status)}</Text>
                    {plan.responsible ? (
                      <Text style={s.planMetaText}>Responsável: {plan.responsible}</Text>
                    ) : null}
                    {plan.deadline ? (
                      <Text style={s.planMetaText}>Prazo: {fmtDate(plan.deadline)}</Text>
                    ) : null}
                  </View>
                  {plan.notes ? (
                    <Text style={[s.planMetaText, { marginTop: 4, fontStyle: "italic" }]}>
                      Obs: {plan.notes}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          );
        })}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>ComplyOn — Gestão de Saúde Mental NR-01</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "results";
  const surveyId = searchParams.get("surveyId");
  const companyId = (session.user as { companyId: string }).companyId;

  try {
    if ((type === "results" || type === "action-plan") && surveyId) {
      const [survey, company] = await Promise.all([
        prisma.survey.findFirst({
          where: { id: surveyId, companyId },
          include: { responses: true, actionPlans: true },
        }),
        prisma.company.findUnique({ where: { id: companyId } }),
      ]);

      if (!survey || !company) {
        return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
      }

      const generatedAt = new Date().toLocaleDateString("pt-BR");
      let pdfBuffer: Buffer;

      if (type === "results") {
        const totalEmployees = await prisma.user.count({
          where: { companyId, active: true },
        });

        const aggregated: Record<string, number[]> = {};
        for (const response of survey.responses) {
          const ans = response.answers as Record<string, number>;
          for (const [key, value] of Object.entries(ans)) {
            if (typeof value !== "number") continue;
            if (!aggregated[key]) aggregated[key] = [];
            aggregated[key].push(value);
          }
        }
        const avgAnswers: Record<string, number> = {};
        for (const [key, values] of Object.entries(aggregated)) {
          avgAnswers[key] = values.reduce((a, b) => a + b, 0) / values.length;
        }

        const sphereScores = calculateAllSphereScores(avgAnswers);
        const overallScore = calculateOverallScore(sphereScores);

        pdfBuffer = await renderToBuffer(
          React.createElement(ResultsPDF, {
            companyName: company.name,
            surveyTitle: survey.title,
            totalResponses: survey.responses.length,
            totalEmployees,
            overallScore,
            sphereScores,
            generatedAt,
          })
        );
      } else {
        pdfBuffer = await renderToBuffer(
          React.createElement(ActionPlanPDF, {
            companyName: company.name,
            surveyTitle: survey.title,
            actionPlans: survey.actionPlans,
            generatedAt,
          })
        );
      }

      const slug = survey.title.replace(/\s+/g, "-").toLowerCase();
      const fileName =
        type === "results"
          ? `relatorio-${slug}.pdf`
          : `plano-acao-${slug}.pdf`;

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Length": pdfBuffer.length.toString(),
        },
      });
    }

    return NextResponse.json({ error: "Tipo de relatório inválido" }, { status: 400 });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
