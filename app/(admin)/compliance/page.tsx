import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplianceChecklist } from "@/components/admin/ComplianceChecklist";
import { Button } from "@/components/ui/button";
import { Shield, FileDown } from "lucide-react";
import { getComplianceData } from "@/lib/compliance-data";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const companyId = (session.user as { companyId: string }).companyId;
  const { companyName, items, okCount, attentionCount, compliancePct } =
    await getComplianceData(companyId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E9D5FF] font-[var(--font-sora)]">
            Conformidade NR-01
          </h1>
          <p className="text-[#9CA3AF] mt-1">
            Acompanhe o cumprimento das exigências da NR-01
          </p>
        </div>
        <a href="/api/reports/compliance" target="_blank" rel="noreferrer">
          <Button variant="secondary" size="sm">
            <FileDown className="h-4 w-4" />
            Exportar Relatório
          </Button>
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#9CA3AF]">Conformidade</p>
                <p className="text-3xl font-bold text-emerald-400 font-mono">{compliancePct}%</p>
              </div>
              <Shield className="h-8 w-8 text-emerald-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-[#9CA3AF] mb-1">Itens Conformes</p>
            <p className="text-3xl font-bold text-emerald-400 font-mono">{okCount}/{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-[#9CA3AF] mb-1">Itens Críticos</p>
            <p className="text-3xl font-bold text-red-400 font-mono">{attentionCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-purple-400" />
            Lista de Verificação NR-01
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => (
              <ComplianceChecklist key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="bg-[#221540] rounded-xl p-4 border border-purple-500/10">
        <p className="text-xs text-[#9CA3AF]">
          <span className="text-purple-400 font-medium">Nota legal:</span> Esta análise é baseada nos dados da plataforma ComplyOn e serve como orientação.
          Consulte um especialista em segurança do trabalho para uma avaliação completa de conformidade com a NR-01.
          Vigência: conforme portaria MTE publicada em 2024.
        </p>
      </div>
    </div>
  );
}
