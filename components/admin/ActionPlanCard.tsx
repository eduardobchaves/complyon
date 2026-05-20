"use client";

import { useState } from "react";
import { SPHERES } from "@/lib/questions";
import { getRiskLabelFromScore } from "@/lib/scoring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, XCircle, PlayCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionPlan {
  id: string;
  sphereId: string;
  title: string;
  description: string;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  responsible: string | null;
  deadline: string | null;
  notes: string | null;
}

interface ActionPlanCardProps {
  plan: ActionPlan;
  onUpdate?: (id: string, data: Partial<ActionPlan>) => Promise<void>;
}

const statusConfig = {
  PENDING: { label: "Pendente", icon: Clock, color: "text-amber-400", variant: "warning" as const },
  IN_PROGRESS: { label: "Em andamento", icon: PlayCircle, color: "text-blue-400", variant: "info" as const },
  COMPLETED: { label: "Concluído", icon: CheckCircle2, color: "text-emerald-400", variant: "success" as const },
  CANCELLED: { label: "Cancelado", icon: XCircle, color: "text-red-400", variant: "destructive" as const },
};

const riskColors = {
  HIGH: "destructive",
  MODERATE: "warning",
  LOW: "success",
} as const;

const riskLabels = {
  HIGH: "Alto Risco",
  MODERATE: "Risco Moderado",
  LOW: "Baixo Risco",
};

export function ActionPlanCard({ plan, onUpdate }: ActionPlanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [responsible, setResponsible] = useState(plan.responsible || "");
  const [deadline, setDeadline] = useState(
    plan.deadline ? new Date(plan.deadline).toISOString().slice(0, 10) : ""
  );
  const [notes, setNotes] = useState(plan.notes || "");
  const [status, setStatus] = useState(plan.status);
  const [saving, setSaving] = useState(false);

  const sphere = SPHERES.find((s) => s.id === plan.sphereId);
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  const handleSave = async () => {
    if (!onUpdate) return;
    setSaving(true);
    try {
      await onUpdate(plan.id, { responsible, deadline, notes, status });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#1A1030] border border-purple-500/10 rounded-xl overflow-hidden">
      <div
        className="p-5 flex items-start gap-4 cursor-pointer hover:bg-[#221540]/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="text-2xl">{sphere?.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-semibold text-[#E9D5FF] font-[var(--font-sora)]">
              {plan.title}
            </h3>
            <Badge variant={riskColors[plan.riskLevel]}>
              {riskLabels[plan.riskLevel]}
            </Badge>
          </div>
          <p className="text-xs text-[#9CA3AF]">{sphere?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("flex items-center gap-1.5 text-xs font-medium", statusInfo.color)}>
            <StatusIcon className="h-3.5 w-3.5" />
            <span>{statusInfo.label}</span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-[#6B7280]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#6B7280]" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-purple-500/10">
          <div className="pt-4">
            <p className="text-sm text-[#9CA3AF] mb-4">{plan.description}</p>

            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Responsável</Label>
                    <Input
                      value={responsible}
                      onChange={(e) => setResponsible(e.target.value)}
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Prazo</Label>
                    <Input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as ActionPlan["status"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                      <SelectItem value="COMPLETED">Concluído</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Notas internas</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anotações sobre o andamento..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#6B7280]">Responsável:</span>{" "}
                    <span className="text-[#E9D5FF]">{plan.responsible || "Não definido"}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Prazo:</span>{" "}
                    <span className="text-[#E9D5FF]">
                      {plan.deadline
                        ? new Date(plan.deadline).toLocaleDateString("pt-BR")
                        : "Não definido"}
                    </span>
                  </div>
                </div>
                {plan.notes && (
                  <div className="bg-[#221540] rounded-lg p-3 text-sm text-[#9CA3AF]">
                    {plan.notes}
                  </div>
                )}
                {onUpdate && (
                  <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                    Editar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
