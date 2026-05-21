"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplianceChecklist } from "@/components/admin/ComplianceChecklist";
import { Button } from "@/components/ui/button";
import { Shield, FileDown, Loader2 } from "lucide-react";
import type { ComplianceItem } from "@/types/index";
import { BASE_ITEMS } from "@/lib/compliance";


interface Override {
  status: "ok" | "pending" | "attention";
  comment: string;
}

export default function CompliancePage() {
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/compliance")
      .then(r => r.json())
      .then((data: { itemId: string; status: string; comment: string }[]) => {
        const map: Record<string, Override> = {};
        for (const o of data) {
          map[o.itemId] = { status: o.status as Override["status"], comment: o.comment };
        }
        setOverrides(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOverrideChange = (itemId: string, override: Override) => {
    setOverrides(prev => ({ ...prev, [itemId]: override }));
  };

  const effectiveItems = BASE_ITEMS.map(item => ({
    ...item,
    status: overrides[item.id]?.status ?? item.status,
  }));

  const okCount = effectiveItems.filter(i => i.status === "ok").length;
  const attentionCount = effectiveItems.filter(i => i.status === "attention").length;
  const compliancePct = Math.round((okCount / effectiveItems.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#dcfce7] font-[var(--font-sora)]">
            Conformidade NR-01
          </h1>
          <p className="text-[#9CA3AF] mt-1">Acompanhe o cumprimento das exigências da NR-01</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => window.open("/api/reports/compliance", "_blank")}>
          <FileDown className="h-4 w-4" />
          Exportar Relatório
        </Button>
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
            <p className="text-3xl font-bold text-emerald-400 font-mono">{okCount}/{effectiveItems.length}</p>
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
            <Shield className="h-4 w-4 text-green-400" />
            Lista de Verificação NR-01
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-green-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {BASE_ITEMS.map(item => (
                <ComplianceChecklist
                  key={item.id}
                  item={item}
                  override={overrides[item.id]}
                  onOverrideChange={handleOverrideChange}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-[#252d45] rounded-xl p-4 border border-green-600/10">
        <p className="text-xs text-[#9CA3AF]">
          <span className="text-green-400 font-medium">Nota legal:</span> Esta análise é baseada nos dados da plataforma ComplyOn e serve como orientação.
          Consulte um especialista em segurança do trabalho para uma avaliação completa de conformidade com a NR-01.
          Vigência: conforme portaria MTE publicada em 2024.
        </p>
      </div>
    </div>
  );
}
