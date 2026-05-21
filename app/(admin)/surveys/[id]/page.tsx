"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SphereCard } from "@/components/admin/SphereCard";
import { SphereBarChart } from "@/components/charts/SphereBarChart";
import { ScoreGauge } from "@/components/charts/ScoreGauge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  ArrowLeft,
  BarChart2,
  Play,
  StopCircle,
  FileDown,
  MessageSquare,
  MapPin,
  Link2,
  Copy,
  Check,
  Trash2,
  Plus,
  Mail,
} from "lucide-react";
import { QUESTIONS } from "@/lib/questions";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "secondary" | "warning" }> = {
  DRAFT: { label: "Rascunho", variant: "secondary" },
  ACTIVE: { label: "Ativa", variant: "success" },
  CLOSED: { label: "Encerrada", variant: "warning" },
  ARCHIVED: { label: "Arquivada", variant: "secondary" },
};

interface TokenRecord {
  id: string;
  token: string;
  usedAt: string | null;
  createdAt: string;
  sentByEmail: boolean;
}

export default function SurveyDetailPage() {
  const router = useRouter();
  const [surveyId, setSurveyId] = useState<string>("");
  const [survey, setSurvey] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [tokenCount, setTokenCount] = useState(10);
  const [generatingTokens, setGeneratingTokens] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [deletingTokens, setDeletingTokens] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [emailResult, setEmailResult] = useState<string | null>(null);

  const fetchTokens = (id: string) =>
    fetch(`/api/surveys/${id}/tokens`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setTokens(data));

  useEffect(() => {
    // Extract survey ID from URL path: /surveys/[id]
    const segments = window.location.pathname.split("/").filter(Boolean);
    const id = segments[segments.indexOf("surveys") + 1] || "";
    setSurveyId(id);
    if (!id) { setLoading(false); return; }

    fetch(`/api/surveys/${id}`)
      .then((r) => r.json())
      .then(setSurvey)
      .finally(() => setLoading(false));
    fetchTokens(id);
  }, []);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      await fetch(`/api/surveys/${surveyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = await fetch(`/api/surveys/${surveyId}`).then((r) => r.json());
      setSurvey(updated);
    } finally {
      setUpdating(false);
    }
  };

  const generateTokens = async () => {
    setGeneratingTokens(true);
    try {
      const res = await fetch(`/api/surveys/${surveyId}/tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: tokenCount }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Erro ao gerar links");
        return;
      }
      await fetchTokens(surveyId);
    } catch {
      alert("Erro ao gerar links");
    } finally {
      setGeneratingTokens(false);
    }
  };

  const sendToEmployees = async () => {
    setSendingEmails(true);
    setEmailResult(null);
    try {
      const res = await fetch(`/api/surveys/${surveyId}/tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendToEmployees: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Erro ao enviar emails");
        return;
      }
      if (data.tokens) setTokens(data.tokens);
      if (data.failed > 0) {
        setEmailResult(`⚠️ ${data.sent} enviado(s), ${data.failed} falhou. Verifique o terminal para detalhes.`);
      } else {
        setEmailResult(`✅ ${data.sent} email(s) enviado(s) com sucesso`);
      }
    } catch {
      alert("Erro ao enviar emails");
    } finally {
      setSendingEmails(false);
    }
  };

  const deleteUnusedTokens = async () => {
    setDeletingTokens(true);
    try {
      await fetch(`/api/surveys/${surveyId}/tokens`, { method: "DELETE" });
      await fetchTokens(surveyId);
    } finally {
      setDeletingTokens(false);
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/s/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const copyAllLinks = () => {
    const unused = tokens.filter((t) => !t.usedAt);
    const text = unused.map((t) => `${window.location.origin}/s/${t.token}`).join("\n");
    navigator.clipboard.writeText(text);
  };

  const downloadLinks = () => {
    const unused = tokens.filter((t) => !t.usedAt);
    const text = unused.map((t, i) => `${i + 1}. ${window.location.origin}/s/${t.token}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `links-pesquisa.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
              <h1 className="text-2xl font-bold text-[#dcfce7] font-[var(--font-sora)]">
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
              <Link href={`/surveys/${surveyId}/action-plan`}>
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4" />
                  Plano de Ação
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(`/api/reports/pdf?type=results&surveyId=${surveyId}`, "_blank")}
              >
                <FileDown className="h-4 w-4" />
                Exportar PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Token Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Link2 className="h-4 w-4 text-green-400" />
            Links de Acesso Anônimo
            <span className="ml-auto text-xs font-normal text-[#9CA3AF]">
              {tokens.filter((t) => t.usedAt).length}/{tokens.length} utilizados
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Send by email */}
          <div className="rounded-lg bg-green-600/10 border border-green-600/20 p-3 flex items-center gap-3">
            <Mail className="h-4 w-4 text-green-400 shrink-0" />
            <div className="flex-1 text-xs text-[#9CA3AF]">
              Enviar um link único por email para cada colaborador ativo cadastrado. O ComplyOn guarda internamente quem recebeu qual link — o admin não tem acesso a essa informação.
            </div>
            <Button onClick={sendToEmployees} disabled={sendingEmails} size="sm" className="shrink-0">
              <Mail className="h-4 w-4" />
              {sendingEmails ? "Enviando..." : "Enviar por email"}
            </Button>
          </div>
          {emailResult && (
            <p className="text-xs text-emerald-400">{emailResult}</p>
          )}

          {/* Manual generation */}
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={1}
              max={500}
              value={tokenCount}
              onChange={(e) => setTokenCount(Number(e.target.value))}
              className="w-28"
            />
            <Button onClick={generateTokens} disabled={generatingTokens} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
              {generatingTokens ? "Gerando..." : `Gerar ${tokenCount} links manuais`}
            </Button>
            {tokens.some((t) => !t.usedAt && !t.sentByEmail) && (
              <>
                <Button variant="outline" size="sm" onClick={copyAllLinks}>
                  <Copy className="h-4 w-4" />
                  Copiar todos
                </Button>
                <Button variant="outline" size="sm" onClick={downloadLinks}>
                  <FileDown className="h-4 w-4" />
                  Baixar .txt
                </Button>
              </>
            )}
            {tokens.some((t) => !t.usedAt) && (
              <Button variant="ghost" size="sm" onClick={deleteUnusedTokens} disabled={deletingTokens} className="text-red-400 hover:text-red-300 ml-auto">
                <Trash2 className="h-4 w-4" />
                {deletingTokens ? "Deletando..." : "Deletar não usados"}
              </Button>
            )}
          </div>

          {tokens.length > 0 && (
            <div className="space-y-1.5">
              <div className="max-h-72 overflow-y-auto space-y-1 border border-white/10 rounded-lg p-2 bg-[#1a1a2e]">
                {tokens.map((t, i) => (
                  <div key={t.id} className="flex items-center gap-2 text-xs font-mono group">
                    <span className="text-[#4B5563] w-5 shrink-0 text-right">{i + 1}.</span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${t.usedAt ? "bg-emerald-400" : "bg-green-400"}`} />
                    {t.sentByEmail ? (
                      <span className="flex items-center gap-1.5 flex-1 text-[#9CA3AF]">
                        <Mail className="h-3 w-3 text-green-400 shrink-0" />
                        <span className={t.usedAt ? "line-through text-[#4B5563]" : ""}>enviado por email</span>
                      </span>
                    ) : (
                      <span className={`flex-1 truncate ${t.usedAt ? "text-[#4B5563] line-through" : "text-[#9CA3AF]"}`}>
                        {`${typeof window !== "undefined" ? window.location.origin : ""}/s/${t.token}`}
                      </span>
                    )}
                    <span className={`text-xs shrink-0 ${t.usedAt ? "text-emerald-400" : "text-[#6B7280]"}`}>
                      {t.usedAt ? "usado" : "livre"}
                    </span>
                    {!t.usedAt && !t.sentByEmail && (
                      <button
                        onClick={() => copyLink(t.token)}
                        className="shrink-0 text-[#6B7280] hover:text-green-300 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {copiedToken === t.token ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tokens.length === 0 && (
            <p className="text-sm text-[#9CA3AF]">
              Nenhum link gerado ainda. Gere links para distribuir aos colaboradores.
            </p>
          )}
        </CardContent>
      </Card>

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
                  <MessageSquare className="h-4 w-4 text-green-400" />
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
                        <h4 className="text-sm font-medium text-[#dcfce7] mb-3">
                          {question.id}. {question.text}
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {qAnswers.map((a, i) => (
                            <div
                              key={i}
                              className="bg-[#252d45] rounded-lg p-3 text-sm text-[#9CA3AF]"
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
