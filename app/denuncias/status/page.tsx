"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Search, Shield, Loader2, Clock, CheckCircle2, Eye } from "lucide-react";

interface ComplaintStatus {
  protocol: string;
  category: string;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  completedAt: string | null;
}

const categoryLabels: Record<string, string> = {
  MORAL_HARASSMENT: "Assédio Moral",
  SEXUAL_HARASSMENT: "Assédio Sexual",
  FRAUD_CORRUPTION: "Fraude / Corrupção",
  NORM_VIOLATION: "Violação de Normas",
  INTERPERSONAL_CONFLICT: "Conflito Interpessoal",
  DISCRIMINATION: "Discriminação",
  OTHER: "Outro",
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  OPEN: {
    label: "Aberta",
    icon: <Clock className="h-4 w-4" />,
    color: "text-amber-400",
  },
  UNDER_REVIEW: {
    label: "Em análise",
    icon: <Eye className="h-4 w-4" />,
    color: "text-blue-400",
  },
  COMPLETED: {
    label: "Concluída",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-emerald-400",
  },
};

export default function ComplaintStatusPage() {
  const [protocol, setProtocol] = useState("");
  const [result, setResult] = useState<ComplaintStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocol.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(`/api/complaints/status?protocol=${encodeURIComponent(protocol.trim().toUpperCase())}`);
      if (res.status === 404) {
        setResult(null);
        setError("Protocolo não encontrado. Verifique o número e tente novamente.");
        return;
      }
      if (!res.ok) throw new Error("Erro ao consultar");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Erro ao consultar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = result ? statusConfig[result.status] : null;

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <header className="border-b border-green-600/20 bg-[#1e2438]">
        <div className="mx-auto max-w-2xl flex items-center gap-3 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-[#dcfce7] font-[var(--font-sora)]">
            Consultar Denúncia — ComplyOn
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#dcfce7] font-[var(--font-sora)]">
            Consultar Status da Denúncia
          </h1>
          <p className="mt-1 text-[#9CA3AF]">
            Informe o número de protocolo recebido no momento do registro para acompanhar o andamento.
          </p>
        </div>

        <div className="rounded-xl border border-green-600/20 bg-[#1e2438] p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 shrink-0 text-green-400 mt-0.5" />
          <div className="text-sm text-[#9CA3AF]">
            <p className="font-medium text-[#dcfce7] mb-1">Consulta Anônima</p>
            <p>A consulta por protocolo não revela nenhum dado identificador. Apenas o status e as informações da denúncia são exibidos.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4 text-green-400" />
              Buscar por Protocolo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label>Número de Protocolo</Label>
                <div className="flex gap-2">
                  <Input
                    value={protocol}
                    onChange={e => setProtocol(e.target.value)}
                    placeholder="Ex: ID1234567"
                    className="font-mono uppercase"
                  />
                  <Button type="submit" disabled={loading || !protocol.trim()}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {loading ? "Buscando..." : "Buscar"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {result && statusInfo && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Denúncia Encontrada</CardTitle>
                <Badge variant={result.status === "COMPLETED" ? "success" : result.status === "UNDER_REVIEW" ? "info" : "warning"}>
                  <span className="flex items-center gap-1">
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#9CA3AF] mb-1">Protocolo</p>
                  <p className="text-sm font-mono font-bold text-green-300">{result.protocol}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF] mb-1">Categoria</p>
                  <p className="text-sm text-[#dcfce7]">{categoryLabels[result.category] || result.category}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF] mb-1">Registrada em</p>
                  <p className="text-sm text-[#dcfce7]">
                    {new Date(result.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {result.reviewedAt && (
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Em análise desde</p>
                    <p className="text-sm text-[#dcfce7]">
                      {new Date(result.reviewedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
                {result.completedAt && (
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Concluída em</p>
                    <p className="text-sm text-[#dcfce7]">
                      {new Date(result.completedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-green-600/10 bg-[#252d45] p-3 text-sm text-[#9CA3AF]">
                {result.status === "OPEN" && (
                  <p>Sua denúncia foi recebida e está aguardando análise. A equipe responsável irá verificar em breve.</p>
                )}
                {result.status === "UNDER_REVIEW" && (
                  <p>Sua denúncia está sendo analisada pela equipe responsável. As providências estão sendo tomadas.</p>
                )}
                {result.status === "COMPLETED" && (
                  <p>Sua denúncia foi analisada e as providências necessárias foram tomadas. Obrigado pela sua contribuição.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {searched && !result && !error && !loading && (
          <div className="text-center py-8 text-[#9CA3AF]">
            <p>Protocolo não encontrado.</p>
          </div>
        )}
      </main>
    </div>
  );
}
