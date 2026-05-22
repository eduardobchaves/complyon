"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Copy, Check, Loader2, Plus, Trash2 } from "lucide-react";

interface SurveyToken {
  id: string;
  token: string;
  used: boolean;
  usedAt: string | null;
  createdAt: string;
}

interface TokensPanelProps {
  surveyId: string;
  surveyStatus: string;
}

function CopyTokenButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}/s/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#E9D5FF] transition-colors font-mono"
      title="Copiar link"
    >
      <span className="max-w-[180px] truncate">{token}</span>
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" /> : <Copy className="h-3.5 w-3.5 flex-shrink-0" />}
    </button>
  );
}

export function TokensPanel({ surveyId, surveyStatus }: TokensPanelProps) {
  const [tokens, setTokens] = useState<SurveyToken[]>([]);
  const [maxEmployees, setMaxEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    const res = await fetch(`/api/surveys/${surveyId}/tokens`);
    if (res.ok) {
      const data = await res.json();
      setTokens(data.tokens);
      setMaxEmployees(data.maxEmployees);
    }
    setLoading(false);
  }, [surveyId]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const generateAll = async () => {
    setGenerating(true);
    setError(null);
    const res = await fetch(`/api/surveys/${surveyId}/tokens`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao gerar links.");
    } else {
      setTokens(data.tokens);
      setMaxEmployees(data.maxEmployees);
    }
    setGenerating(false);
  };

  const deleteUnused = async () => {
    setDeleting(true);
    setError(null);
    const res = await fetch(`/api/surveys/${surveyId}/tokens`, { method: "DELETE" });
    if (res.ok) {
      await fetchTokens();
    }
    setDeleting(false);
  };

  const usedCount = tokens.filter((t) => t.used).length;
  const unusedCount = tokens.filter((t) => !t.used).length;
  const canGenerate = maxEmployees - tokens.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Link2 className="h-4 w-4 text-purple-400" />
            Links de Pesquisa
          </CardTitle>
          <div className="flex items-center gap-2">
            {unusedCount > 0 && (
              <Button variant="ghost" size="sm" onClick={deleteUnused} disabled={deleting} className="text-xs text-red-400 hover:text-red-300">
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Remover não usados
              </Button>
            )}
            {canGenerate > 0 && surveyStatus === "ACTIVE" && (
              <Button size="sm" onClick={generateAll} disabled={generating}>
                {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Gerar {canGenerate} link{canGenerate !== 1 ? "s" : ""}
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-1">
          {tokens.length} de {maxEmployees} links gerados · {usedCount} utilizados · {unusedCount} disponíveis
        </p>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {surveyStatus !== "ACTIVE" && tokens.length === 0 && (
          <p className="text-sm text-[#6B7280] text-center py-4">
            Ative a pesquisa para gerar links de acesso.
          </p>
        )}

        {surveyStatus === "ACTIVE" && tokens.length === 0 && !loading && (
          <p className="text-sm text-[#6B7280] text-center py-4">
            Clique em &quot;Gerar links&quot; para criar os links de acesso anônimo.
          </p>
        )}

        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
          </div>
        )}

        {tokens.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {tokens.map((t, i) => (
              <div
                key={t.id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                  t.used ? "bg-[#221540]/50 opacity-50" : "bg-[#221540]"
                }`}
              >
                <span className="text-[#6B7280] w-6 flex-shrink-0">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <CopyTokenButton token={t.token} />
                </div>
                <span className={`ml-3 flex-shrink-0 font-medium ${t.used ? "text-emerald-500" : "text-[#6B7280]"}`}>
                  {t.used ? "Usado" : "Disponível"}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
