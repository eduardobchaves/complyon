"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionPlanCard } from "@/components/admin/ActionPlanCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ArrowLeft, MapPin, Plus, FileDown } from "lucide-react";
import { getRecommendation } from "@/lib/action-plans";
import { SPHERES } from "@/lib/questions";

interface ActionPlan {
  id: string;
  sphereId: string;
  title: string;
  description: string;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  responsible: string | null;
  deadline: string | null;
  notes: string | null;
}

export default function ActionPlanPage() {
  const params = useParams();
  const [survey, setSurvey] = useState<Record<string, unknown> | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/surveys/${params.id}`).then((r) => r.json()),
      fetch(`/api/action-plans?surveyId=${params.id}`).then((r) => r.json()).catch(() => []),
    ]).then(([surveyData, plans]) => {
      setSurvey(surveyData);
      setActionPlans(Array.isArray(plans) ? plans : []);
    }).finally(() => setLoading(false));
  }, [params.id]);

  const generatePlans = async () => {
    if (!survey) return;
    setGenerating(true);
    try {
      const sphereScores = survey.sphereScores as Array<{ sphereId: string; score: number; riskLevel: string }> || [];
      
      for (const sphereScore of sphereScores) {
        const sphere = SPHERES.find((s) => s.id === sphereScore.sphereId);
        if (!sphere) continue;

        const recommendation = getRecommendation(
          sphereScore.sphereId as Parameters<typeof getRecommendation>[0],
          sphereScore.riskLevel as "LOW" | "MODERATE" | "HIGH"
        );

        await fetch("/api/action-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            surveyId: params.id,
            sphereId: sphereScore.sphereId,
            title: `Plano de Ação — ${sphere.name}`,
            description: recommendation,
            riskLevel: sphereScore.riskLevel,
          }),
        });
      }

      const plans = await fetch(`/api/action-plans?surveyId=${params.id}`).then((r) => r.json());
      setActionPlans(Array.isArray(plans) ? plans : []);
    } finally {
      setGenerating(false);
    }
  };

  const updatePlan = async (id: string, data: Partial<ActionPlan>) => {
    await fetch(`/api/action-plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const plans = await fetch(`/api/action-plans?surveyId=${params.id}`).then((r) => r.json());
    setActionPlans(Array.isArray(plans) ? plans : []);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/surveys/${params.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#dcfce7] font-[var(--font-sora)]">
              Plano de Ação
            </h1>
            <p className="text-[#9CA3AF] mt-1">
              {survey?.title as string || ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actionPlans.length === 0 && (
            <Button onClick={generatePlans} disabled={generating}>
              <Plus className="h-4 w-4" />
              {generating ? "Gerando..." : "Gerar Recomendações"}
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(`/api/reports/pdf?type=action-plan&surveyId=${params.id}`, "_blank")}
          >
            <FileDown className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {actionPlans.length === 0 ? (
        <Card>
          <CardContent className="py-0">
            <EmptyState
              icon={MapPin}
              title="Nenhum plano de ação criado"
              description="Gere recomendações automáticas baseadas nos resultados da pesquisa."
              action={
                <Button onClick={generatePlans} disabled={generating}>
                  <Plus className="h-4 w-4" />
                  {generating ? "Gerando..." : "Gerar Recomendações"}
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* High risk first */}
          {["HIGH", "MODERATE", "LOW"].map((risk) => {
            const plans = actionPlans.filter((p) => p.riskLevel === risk);
            if (plans.length === 0) return null;

            const labels = { HIGH: "Alto Risco", MODERATE: "Risco Moderado", LOW: "Baixo Risco" };
            const colors = { HIGH: "text-red-400", MODERATE: "text-amber-400", LOW: "text-emerald-400" };

            return (
              <div key={risk}>
                <h2 className={`text-sm font-semibold mb-3 ${colors[risk as keyof typeof colors]}`}>
                  {labels[risk as keyof typeof labels]} ({plans.length})
                </h2>
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <ActionPlanCard key={plan.id} plan={plan} onUpdate={updatePlan} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
