import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function SurveyCompletePage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
      </div>
      <h1 className="text-3xl font-bold text-[#E9D5FF] mb-3 font-[var(--font-sora)]">
        Obrigado pela sua participação!
      </h1>
      <p className="text-[#9CA3AF] max-w-md mb-4">
        Suas respostas foram registradas com sucesso de forma completamente anônima.
        Seu feedback é fundamental para melhorar o ambiente de trabalho de todos.
      </p>
      <div className="mb-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-4 text-sm text-emerald-300 max-w-sm">
        🔒 Lembre-se: suas respostas são 100% anônimas. Nenhum dado identificador foi armazenado.
      </div>
      <div className="space-y-3">
        <p className="text-sm font-medium text-[#9CA3AF]">Dica de bem-estar</p>
        <p className="text-sm text-[#E9D5FF] max-w-sm italic">
          "Pequenas pausas ao longo do dia ajudam a manter o foco e reduzir o estresse. Reserve 5 minutos para respirar fundo e se reconectar."
        </p>
      </div>
    </div>
  );
}
