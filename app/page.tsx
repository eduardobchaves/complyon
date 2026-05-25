import Link from "next/link";
import { Brain, Shield, BarChart3, FileCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      {/* Header */}
      <header className="border-b border-green-600/20 bg-[#1e2438]/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[#dcfce7] font-[var(--font-sora)]">ComplyOn</span>
            <span className="text-xs text-green-400 border border-green-600/30 rounded px-1.5 py-0.5">NR-01</span>
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
        <div className="inline-flex items-center gap-2 rounded-full border border-green-600/30 bg-green-600/10 px-4 py-1.5 text-xs text-green-300 mb-8">
          <CheckCircle2 className="h-3 w-3" />
          Conforme Portaria MTE nº 765/2025 — NR-01
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold text-[#dcfce7] mb-6 leading-tight font-[var(--font-sora)]">
          Gestão de Saúde Mental{" "}
          <span className="text-green-400">Corporativa</span>
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
          <div className="rounded-2xl border border-green-600/20 bg-[#1e2438] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600/20 border border-green-600/30 mb-4">
              <BarChart3 className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="font-semibold text-[#dcfce7] mb-2 font-[var(--font-sora)]">Pesquisa de Clima Anônima</h3>
            <p className="text-sm text-[#9CA3AF]">
              26 perguntas validadas sobre 8 esferas psicossociais. Respostas 100% anônimas com scores automatizados por esfera.
            </p>
          </div>

          <div className="rounded-2xl border border-green-600/20 bg-[#1e2438] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 border border-emerald-500/30 mb-4">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-[#dcfce7] mb-2 font-[var(--font-sora)]">Canal de Denúncias Anônimo</h3>
            <p className="text-sm text-[#9CA3AF]">
              URL exclusiva por empresa para denúncias de assédio e irregularidades. Nenhum dado identificador é armazenado.
            </p>
          </div>

          <div className="rounded-2xl border border-green-600/20 bg-[#1e2438] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600/20 border border-amber-500/30 mb-4">
              <FileCheck className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="font-semibold text-[#dcfce7] mb-2 font-[var(--font-sora)]">Conformidade NR-01</h3>
            <p className="text-sm text-[#9CA3AF]">
              Painel de conformidade em tempo real com os 8 requisitos da NR-01 para riscos psicossociais. Relatórios exportáveis.
            </p>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t border-green-600/20 bg-[#1e2438] mt-16">
        <div className="mx-auto max-w-6xl px-4 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-green-600">
              <Brain className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm text-[#9CA3AF]">ComplyOn © 2025</span>
          </div>
          <p className="text-xs text-[#6B7280]">Conforme Portaria MTE nº 765/2025</p>
        </div>
      </footer>
    </div>
  );
}
