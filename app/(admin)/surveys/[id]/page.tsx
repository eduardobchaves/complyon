"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SphereCard } from "@/components/admin/SphereCard";
import { SphereBarChart } from "@/components/charts/SphereBarChart";
import { ScoreGauge } from "@/components/charts/ScoreGauge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  BarChart2,
  Users,
  Play,
  StopCircle,
  FileDown,
  MessageSquare,
  MapPin,
} from "lucide-react";
import { QUESTIONS } from "@/lib/questions";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "secondary" | "warning" }> = {
  DRAFT: { label: "Rascunho", variant: "secondary" },
  ACTIVE: { label: "Ativa", variant: "success" },
  CLOSED: { label: "Encerrada", variant: "warning" },
  ARCHIVED: { label: "Arquivada", variant: "secondary" },
};

export default function SurveyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [survey, setSurvey] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hrMessage, setHrMessage] = useState("");
  const [savingMessage, setSavingMessage] = useState(false);

  useEffect(() => {
    fetch(`/api/surveys/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setSurvey(data);
        setHrMessage((data.hrMessage as string) || "");
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const saveHrMessage = async () => {
    setSavingMessage(true);
    await fetch(`/api/surveys/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hrMessage }),
    });
    setSavingMessage(false);
  };

  const updateStatus = async (status: string) => {
    setUpdating(true);
    await fetch(`/api/surveys/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const updated = await fetch(`/api/surveys/${params.id}`).then((r) => r.json());
    setSurvey(updated);
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-16">
        <p className="text-[#9CA3AF]">Pesquisa não encontrada.</p>
      </div>
    );
  }

  const status = survey.status as string;
  const statusInfo = statusConfig[status] || { label: status, variant: "secondary" as const };
  const sphereScores = (survey.sphereScores as Array<{ sphereId: string; score: number; riskLevel: string }>) || [];
  const overallScore = survey.overallScore as number || 0;
  const totalResponses = survey.totalResponses as number || 0;
  const responseRate = survey.responseRate as number || 0;
  const openAnswers = (survey.openAnswers as Array<{ questionId: number; answer: string; responseId: string }>) || [];

  const openQuestions = QUESTIONS.filter((q) => q.type !== "likert");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/surveys">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[#E9D5FF] font-[var(--font-sora)]">
                {survey.title as string}
              </h1>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
            <p className="text-[#9CA3AF] text-sm">
              {totalResponses} respostas · {responseRate}% de participação
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {status === "DRAFT" && (
            <Button onClick={() => updateStatus("ACTIVE")} disabled={updating}>
              <Play className="h-4 w-4" />
              Ativar Pesquisa
            </Button>
          )}
          {status === "ACTIVE" && (
            <Button variant="outline" onClick={() => updateStatus("CLOSED")} disabled={updating}>
              <StopCircle className="h-4 w-4" />
              Encerrar
            </Button>
          )}
          {(status === "CLOSED" || status === "ARCHIVED") && (
            <>
              <Link href={`/surveys/${params.id}/action-plan`}>
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4" />
                  Plano de Ação
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(`/api/reports/pdf?type=results&surveyId=${params.id}`, "_blank")}
              >
                <FileDown className="h-4 w-4" />
                Exportar PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {status === "DRAFT" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              Mensagem do RH
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-[#9CA3AF]">
              Esta mensagem será incluída no email enviado aos colaboradores ao ativar a pesquisa. Opcional.
            </p>
            <Textarea
              value={hrMessage}
              onChange={(e) => setHrMessage(e.target.value)}
              placeholder="Ex: Olá equipe! Convidamos você a participar da nossa pesquisa de clima organizacional..."
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9CA3AF]">{hrMessage.length}/500</span>
              <Button size="sm" variant="outline" onClick={saveHrMessage} disabled={savingMessage}>
                {savingMessage ? "Salvando..." : "Salvar Mensagem"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {totalResponses === 0 ? (
        <Card>
          <CardContent className="py-0">
            <EmptyState
              icon={BarChart2}
              title={status === "DRAFT" ? "Pesquisa ainda não ativada" : "Nenhuma resposta coletada"}
              description={
                status === "DRAFT"
                  ? "Ative a pesquisa para que os colaboradores possam responder."
                  : "Aguarde os colaboradores responderem para ver os resultados."
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Score overview */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="flex flex-col items-center justify-center py-6">
              <CardContent>
                <ScoreGauge score={overallScore} size={120} />
              </CardContent>
            </Card>
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

          {/* Sphere grid */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {sphereScores.map((sphere) => (
              <SphereCard
                key={sphere.sphereId}
                sphereId={sphere.sphereId}
                score={sphere.score}
                riskLevel={sphere.riskLevel as "LOW" | "MODERATE" | "HIGH"}
              />
            ))}
          </div>

          {/* Open answers */}
          {openAnswers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                  Respostas Abertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {openQuestions.map((question) => {
                    const qAnswers = openAnswers.filter(
                      (a) => a.questionId === question.id
                    );
                    if (qAnswers.length === 0) return null;

                    return (
                      <div key={question.id}>
                        <h4 className="text-sm font-medium text-[#E9D5FF] mb-3">
                          {question.id}. {question.text}
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {qAnswers.map((a, i) => (
                            <div
                              key={i}
                              className="bg-[#221540] rounded-lg p-3 text-sm text-[#9CA3AF]"
                            >
                              {a.answer}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
