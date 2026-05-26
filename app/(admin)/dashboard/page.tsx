import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { aggregateResponseScores, calculateAllSphereScores, calculateOverallScore, getRiskLabelFromScore, getScoreColorClass } from "@/lib/scoring";
import { QUESTIONS } from "@/lib/questions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SphereCard } from "@/components/admin/SphereCard";
import { SphereBarChart } from "@/components/charts/SphereBarChart";
import { ScoreGauge } from "@/components/charts/ScoreGauge";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { EmptyState } from "@/components/shared/EmptyState";
import { BarChart2, Users, MessageSquare, AlertTriangle, ClipboardList } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ComplaintLinkCard } from "@/components/admin/ComplaintLinkCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const companyId = (session.user as { companyId: string }).companyId;
  const companySlug = (session.user as { companySlug: string }).companySlug;

  const [surveys, complaints, totalEmployees] = await Promise.all([
    prisma.survey.findMany({
      where: { companyId },
      include: { responses: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.complaint.findMany({
      where: { companyId, status: { in: ["OPEN", "UNDER_REVIEW"] } },
    }),
    prisma.user.count({ where: { companyId, active: true } }),
  ]);

  // Get latest closed survey for stats
  const latestClosed = surveys.find((s: typeof surveys[number]) => s.status === "CLOSED" || s.status === "ARCHIVED");
  const activeSurvey = surveys.find((s: typeof surveys[number]) => s.status === "ACTIVE");

  let sphereScores: ReturnType<typeof calculateAllSphereScores> = [];
  let overallScore = 0;
  let responseRate = 0;
  let totalRespondents = 0;

  if (latestClosed && latestClosed.responses.length > 0) {
    const responsesScores = latestClosed.responses
      .map((r: typeof latestClosed.responses[number]) => r.scores as Record<string, number> | null)
      .filter((s: Record<string, number> | null): s is Record<string, number> => s !== null);

    const aggregatedScores = aggregateResponseScores(responsesScores);
    
    const answers: Record<string, number> = {};
    for (const [sphereId, score] of Object.entries(aggregatedScores)) {
      const questions = QUESTIONS.filter((q) => q.sphereId === sphereId && q.type === "likert");
      for (const q of questions) {
        answers[q.id.toString()] = score;
      }
    }

    sphereScores = calculateAllSphereScores(answers);
    overallScore = calculateOverallScore(sphereScores);
    totalRespondents = latestClosed.responses.length;
    responseRate = totalEmployees > 0
      ? Math.round((totalRespondents / totalEmployees) * 100)
      : 0;
  }

  const highRiskSpheres = sphereScores.filter((s) => s.riskLevel === "HIGH");

  // Historical trend (last 5 surveys with responses)
  const surveysWithResponses = surveys
    .filter((s) => s.responses.length > 0 && (s.status === "CLOSED" || s.status === "ARCHIVED"))
    .slice(0, 5)
    .reverse();

  const trendData = surveysWithResponses.map((survey) => {
    const responsesScores = survey.responses
      .map((r) => r.scores as Record<string, number> | null)
      .filter((s): s is Record<string, number> => s !== null);

    if (responsesScores.length === 0) return null;

    const aggregated = aggregateResponseScores(responsesScores);
    const answers: Record<string, number> = {};
    for (const [sphereId, score] of Object.entries(aggregated)) {
      const questions = QUESTIONS.filter((q) => q.sphereId === sphereId && q.type === "likert");
      for (const q of questions) {
        answers[q.id.toString()] = score;
      }
    }
    const spheres = calculateAllSphereScores(answers);
    const overall = calculateOverallScore(spheres);

    return {
      date: survey.createdAt.toISOString(),
      score: overall,
      label: survey.title.slice(0, 15) + (survey.title.length > 15 ? "..." : ""),
    };
  }).filter((d): d is NonNullable<typeof d> => d !== null);

  const hasSurveyData = sphereScores.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#dcfce7] font-[var(--font-sora)]">Dashboard</h1>
          <p className="text-[#9CA3AF] mt-1">Visão geral do clima organizacional</p>
        </div>
        {activeSurvey && (
          <Badge variant="success" className="text-sm px-3 py-1">
            Pesquisa ativa: {activeSurvey.title}
          </Badge>
        )}
      </div>

      {/* High risk alert */}
      {highRiskSpheres.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Esferas em Alto Risco</AlertTitle>
          <AlertDescription>
            {highRiskSpheres.map((s) => s.sphereName).join(", ")} requerem ação imediata conforme NR-01 §1.5.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Score Geral</p>
                <p className={`text-3xl font-bold font-mono ${hasSurveyData ? getScoreColorClass(overallScore) : "text-[#6B7280]"}`}>
                  {hasSurveyData ? overallScore.toFixed(1) : "--"}
                </p>
                {hasSurveyData && (
                  <p className="text-xs text-[#9CA3AF] mt-1">{getRiskLabelFromScore(overallScore)}</p>
                )}
              </div>
              <BarChart2 className="h-8 w-8 text-green-600/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Taxa de Resposta</p>
                <p className="text-3xl font-bold text-[#dcfce7] font-mono">
                  {hasSurveyData ? `${responseRate}%` : "--"}
                </p>
                {hasSurveyData && (
                  <p className="text-xs text-[#9CA3AF] mt-1">{totalRespondents} respondentes</p>
                )}
              </div>
              <ClipboardList className="h-8 w-8 text-green-600/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Colaboradores</p>
                <p className="text-3xl font-bold text-[#dcfce7] font-mono">{totalEmployees}</p>
                <p className="text-xs text-[#9CA3AF] mt-1">ativos</p>
              </div>
              <Users className="h-8 w-8 text-green-600/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Denúncias Abertas</p>
                <p className={`text-3xl font-bold font-mono ${complaints.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {complaints.length}
                </p>
                <p className="text-xs text-[#9CA3AF] mt-1">aguardando análise</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaint public link */}
      <ComplaintLinkCard slug={companySlug} />

      {hasSurveyData ? (
        <>
          {/* Charts */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 flex flex-col items-center justify-center">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-sm">Score Geral</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center pb-6">
                  <ScoreGauge score={overallScore} size={140} />
                </CardContent>
              </Card>
            </div>

            <div className="col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Score por Esfera</CardTitle>
                </CardHeader>
                <CardContent>
                  <SphereBarChart data={sphereScores} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Trend */}
          {trendData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Evolução do Score</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendLineChart data={trendData} />
              </CardContent>
            </Card>
          )}

          {/* Sphere grid */}
          <div>
            <h2 className="text-base font-semibold text-[#dcfce7] mb-4 font-[var(--font-sora)]">
              Detalhes por Esfera
            </h2>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {sphereScores.map((sphere) => (
                <SphereCard
                  key={sphere.sphereId}
                  sphereId={sphere.sphereId}
                  score={sphere.score}
                  riskLevel={sphere.riskLevel}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-0">
            <EmptyState
              icon={BarChart2}
              title="Nenhuma pesquisa concluída ainda"
              description="Crie e ative uma pesquisa de clima para ver os resultados aqui."
              action={
                <Link href="/surveys/new">
                  <Button>Criar primeira pesquisa</Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
