"use client";

import { useEffect, useState } from "react";
import { Brain, CreditCard, Users, CheckCircle, AlertTriangle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BILLING_TIERS, calculateMonthlyBilling, formatBRL } from "@/lib/billing-utils";

interface BillingInfo {
  plan: string;
  employeeCount: number;
  estimatedCents: number;
  hasCustomer: boolean;
  trialEndsAt: string | null;
}

export default function BillingPage() {
  const [info, setInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Check URL params for Stripe redirect results
  const [successMsg, setSuccessMsg] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) setSuccessMsg("Assinatura ativada com sucesso! Obrigado.");
    if (params.get("canceled")) setError("Pagamento cancelado. Tente novamente quando quiser.");
    window.history.replaceState({}, "", "/billing");
  }, []);

  useEffect(() => {
    fetch("/api/billing/info")
      .then(r => r.json())
      .then(data => setInfo(data))
      .catch(() => setError("Erro ao carregar informações de cobrança"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async () => {
    setActionLoading(true);
    setError("");
    const res = await fetch("/api/billing/subscribe", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error || "Erro ao iniciar pagamento");
      setActionLoading(false);
    }
  };

  const handleManage = async () => {
    setActionLoading(true);
    setError("");
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error || "Erro ao abrir portal");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
      </div>
    );
  }

  const isSuspended = info?.plan === "SUSPENDED";
  const isActive = info?.plan === "ACTIVE";
  const isFree = !isActive && !isSuspended;
  const estimatedBRL = info ? formatBRL(info.estimatedCents) : "—";
  const trialDaysLeft = info?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(info.trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#dcfce7] font-[var(--font-sora)]">Cobrança</h1>
        <p className="text-[#9CA3AF] text-sm mt-1">Gerencie sua assinatura ComplyOn.</p>
      </div>

      {successMsg && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Status card */}
      <div className={`rounded-xl border p-6 space-y-4 ${
        isActive ? "border-emerald-500/30 bg-emerald-500/5" :
        isSuspended ? "border-red-500/30 bg-red-500/5" :
        "border-green-600/20 bg-[#1e2438]"
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isActive ? "bg-emerald-500/20" : isSuspended ? "bg-red-500/20" : "bg-green-600/20"
            }`}>
              <CreditCard className={`h-5 w-5 ${
                isActive ? "text-emerald-400" : isSuspended ? "text-red-400" : "text-green-400"
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#dcfce7]">Status da assinatura</p>
              <p className={`text-xs font-semibold ${
                isActive ? "text-emerald-400" : isSuspended ? "text-red-400" : "text-[#9CA3AF]"
              }`}>
                {isActive ? "Ativa" : isSuspended ? "Pagamento pendente" : "Não assinado"}
              </p>
            </div>
          </div>

          {isActive || (info?.hasCustomer && isSuspended) ? (
            <Button onClick={handleManage} disabled={actionLoading} variant="outline">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Gerenciar assinatura
            </Button>
          ) : (
            <Button onClick={handleSubscribe} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Começar 7 dias grátis
            </Button>
          )}
        </div>

        {isSuspended && (
          <p className="text-xs text-red-300 bg-red-500/10 rounded-lg px-3 py-2">
            O acesso está suspenso por falha no pagamento. Clique em "Gerenciar assinatura" para atualizar seu cartão.
          </p>
        )}
        {trialDaysLeft !== null && trialDaysLeft > 0 && (
          <p className="text-xs text-green-300 bg-green-600/10 rounded-lg px-3 py-2">
            🎉 Você está no período de teste gratuito. Seu período de teste encerra em <strong>{trialDaysLeft} dia{trialDaysLeft !== 1 ? "s" : ""}</strong>.
            Nenhuma cobrança será feita até lá.
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-[#1a1a2e]/60 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-xs text-[#9CA3AF]">Colaboradores ativos</span>
            </div>
            <p className="text-2xl font-bold text-[#dcfce7]">{info?.employeeCount ?? 0}</p>
          </div>
          <div className="bg-[#1a1a2e]/60 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-4 w-4 text-green-400" />
              <span className="text-xs text-[#9CA3AF]">Estimativa mensal</span>
            </div>
            <p className="text-2xl font-bold text-[#dcfce7]">{estimatedBRL}</p>
          </div>
        </div>
      </div>

      {/* Pricing table */}
      <div className="rounded-xl border border-green-600/20 bg-[#1e2438] p-6">
        <h2 className="text-sm font-semibold text-[#dcfce7] mb-4">Tabela de preços por colaborador / mês</h2>
        <div className="space-y-1">
          {BILLING_TIERS.map((tier, i) => {
            const prev = i === 0 ? 0 : BILLING_TIERS[i - 1].upTo as number;
            const label = tier.upTo === Infinity
              ? `Acima de ${prev}`
              : i === 0
                ? `1 a ${tier.upTo}`
                : `${prev + 1} a ${tier.upTo}`;
            const inRange = info && info.employeeCount > prev &&
              (tier.upTo === Infinity || info.employeeCount <= (tier.upTo as number));
            return (
              <div
                key={i}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  inRange ? "bg-green-600/20 text-[#dcfce7]" : "text-[#9CA3AF]"
                }`}
              >
                <span>{label} colaboradores</span>
                <span className={`font-mono font-medium ${inRange ? "text-green-300" : ""}`}>
                  {formatBRL(tier.unitCents)} / pessoa
                  {i > 0 && <span className="text-xs ml-2 text-emerald-400">
                    -{Math.round((1 - tier.unitCents / 1200) * 100)}%
                  </span>}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-[#6B7280] mt-4">
          O desconto é aplicado apenas sobre os colaboradores dentro de cada faixa (preço graduado).
          Para {info?.employeeCount ?? 0} colaboradores: <strong className="text-[#9CA3AF]">{estimatedBRL}/mês</strong>.
        </p>
        {isFree && (
          <div className="mt-4 rounded-lg border border-green-600/30 bg-green-600/5 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium text-[#dcfce7]">Teste grátis por 7 dias</p>
              <p className="text-xs text-[#9CA3AF]">Cadastre seu cartão agora e explore a plataforma sem custo.</p>
            </div>
            <Button onClick={handleSubscribe} disabled={actionLoading} size="sm">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Começar grátis
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
