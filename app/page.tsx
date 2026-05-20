import Link from "next/link";
import { Brain, Shield, BarChart3, FileCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F0A1A] text-white">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-[#1A1030]/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[#E9D5FF] font-[var(--font-sora)]">SafeMind</span>
            <span className="text-xs text-purple-400 border border-purple-500/30 rounded px-1.5 py-0.5">NR-01</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button size="sm">Entrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs text-purple-300 mb-8">
          <CheckCircle2 className="h-3 w-3" />
          Conforme Portaria MTE nº 765/2025 — NR-01
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold text-[#E9D5FF] mb-6 leading-tight font-[var(--font-sora)]">
          Gestão de Saúde Mental{" "}
          <span className="text-purple-400">Corporativa</span>
        </h1>
        <p className="text-lg text-[#9CA3AF] max-w-2xl mx-auto mb-10">
          Identifique riscos psicossociais, gerencie pesquisas de clima anônimas e garanta a conformidade da sua empresa com a NR-01 — tudo em uma plataforma.
        </p>
        <div className="flex justify-center">
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Acessar plataforma
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-purple-500/20 bg-[#1A1030] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/30 mb-4">
              <BarChart3 className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-[#E9D5FF] mb-2 font-[var(--font-sora)]">Pesquisa de Clima Anônima</h3>
            <p className="text-sm text-[#9CA3AF]">
              26 perguntas validadas sobre 8 esferas psicossociais. Respostas 100% anônimas com scores automatizados por esfera.
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-[#1A1030] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 border border-emerald-500/30 mb-4">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-[#E9D5FF] mb-2 font-[var(--font-sora)]">Canal de Denúncias Anônimo</h3>
            <p className="text-sm text-[#9CA3AF]">
              URL exclusiva por empresa para denúncias de assédio e irregularidades. Nenhum dado identificador é armazenado.
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-[#1A1030] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600/20 border border-amber-500/30 mb-4">
              <FileCheck className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="font-semibold text-[#E9D5FF] mb-2 font-[var(--font-sora)]">Conformidade NR-01</h3>
            <p className="text-sm text-[#9CA3AF]">
              Painel de conformidade em tempo real com os 8 requisitos da NR-01 para riscos psicossociais. Relatórios exportáveis.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-bold text-[#E9D5FF] text-center mb-10 font-[var(--font-sora)]">Planos simples e transparentes</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-purple-500/20 bg-[#1A1030] p-6">
            <p className="text-sm font-medium text-purple-400 mb-1">FREE</p>
            <p className="text-3xl font-bold text-[#E9D5FF] mb-1 font-mono">R$0</p>
            <p className="text-xs text-[#9CA3AF] mb-6">Até 30 colaboradores</p>
            <ul className="space-y-2 text-sm text-[#9CA3AF]">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> 1 pesquisa ativa</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Canal de denúncias</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Dashboard básico</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-purple-500/40 bg-[#221540] p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-purple-600 text-white px-3 py-1 rounded-full">Popular</div>
            <p className="text-sm font-medium text-purple-400 mb-1">STARTER</p>
            <p className="text-3xl font-bold text-[#E9D5FF] mb-1 font-mono">R$490<span className="text-base font-normal text-[#9CA3AF]">/mês</span></p>
            <p className="text-xs text-[#9CA3AF] mb-6">Até 200 colaboradores</p>
            <ul className="space-y-2 text-sm text-[#9CA3AF]">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Pesquisas ilimitadas</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Relatório de conformidade</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Planos de ação</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Exportar PDF</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-[#1A1030] p-6">
            <p className="text-sm font-medium text-purple-400 mb-1">GROWTH</p>
            <p className="text-3xl font-bold text-[#E9D5FF] mb-1 font-mono">R$990<span className="text-base font-normal text-[#9CA3AF]">/mês</span></p>
            <p className="text-xs text-[#9CA3AF] mb-6">Colaboradores ilimitados</p>
            <ul className="space-y-2 text-sm text-[#9CA3AF]">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Tudo do Starter</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> API access</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Suporte dedicado</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> SSO / SAML</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-[#1A1030] mt-16">
        <div className="mx-auto max-w-6xl px-4 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-600">
              <Brain className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm text-[#9CA3AF]">SafeMind NR-01 © 2025</span>
          </div>
          <p className="text-xs text-[#6B7280]">Conforme Portaria MTE nº 765/2025</p>
        </div>
      </footer>
    </div>
  );
}
