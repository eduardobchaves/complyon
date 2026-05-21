"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, ChevronDown, ChevronUp, Pencil, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ComplianceItem } from "@/types/index";

interface Override {
  status: "ok" | "pending" | "attention";
  comment: string;
}

interface Props {
  item: ComplianceItem;
  override?: Override;
  onOverrideChange: (itemId: string, override: Override) => void;
}

const statusConfig = {
  ok: {
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    badge: <Badge variant="success">Conforme</Badge>,
  },
  pending: {
    icon: <Clock className="h-4 w-4 text-amber-400" />,
    badge: <Badge variant="warning">Pendente</Badge>,
  },
  attention: {
    icon: <AlertTriangle className="h-4 w-4 text-red-400" />,
    badge: <Badge variant="destructive">Atenção</Badge>,
  },
};

export function ComplianceChecklist({ item, override, onOverrideChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newStatus, setNewStatus] = useState<string>(override?.status ?? item.status);
  const [comment, setComment] = useState(override?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveStatus = (override?.status ?? item.status) as "ok" | "pending" | "attention";
  const config = statusConfig[effectiveStatus];

  const handleSave = async () => {
    if (!comment.trim()) {
      setError("Comentário é obrigatório ao alterar o status.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, status: newStatus, comment: comment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      onOverrideChange(item.id, { status: newStatus as Override["status"], comment: comment.trim() });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNewStatus(override?.status ?? item.status);
    setComment(override?.comment ?? "");
    setError(null);
    setEditing(false);
  };

  return (
    <div className="rounded-xl border border-green-600/10 bg-[#1e2438] overflow-hidden">
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-green-600/5 transition-colors"
        onClick={() => !editing && setExpanded(e => !e)}
      >
        <div className="mt-0.5 shrink-0">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[#dcfce7]">{item.title}</span>
            <span className="text-xs text-[#6B7280] font-mono">{item.legalRef}</span>
            {config.badge}
            {override && (
              <span className="text-xs text-green-400 border border-green-600/30 rounded px-1.5 py-0.5">manual</span>
            )}
          </div>
          {!expanded && (
            <p className="text-xs text-[#9CA3AF] mt-1 truncate">{override?.comment ?? item.detail}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={e => { e.stopPropagation(); setEditing(true); setExpanded(true); }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          {expanded ? <ChevronUp className="h-4 w-4 text-[#6B7280]" /> : <ChevronDown className="h-4 w-4 text-[#6B7280]" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-green-600/10 pt-3 space-y-3">
          <p className="text-xs text-[#9CA3AF]">{item.description}</p>

          {override?.comment && !editing && (
            <div className="rounded-lg bg-green-600/10 border border-green-600/20 px-3 py-2">
              <p className="text-xs text-[#6B7280] mb-0.5">Comentário</p>
              <p className="text-xs text-[#dcfce7]">{override.comment}</p>
            </div>
          )}

          {!override?.comment && item.detail && !editing && (
            <div className="rounded-lg bg-[#252d45] px-3 py-2">
              <p className="text-xs text-[#9CA3AF]">{item.detail}</p>
            </div>
          )}

          {editing && (
            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <p className="text-xs text-[#9CA3AF]">Alterar status</p>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ok">Conforme</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="attention">Atenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-[#9CA3AF]">
                  Comentário <span className="text-red-400">*</span>
                </p>
                <Textarea
                  value={comment}
                  onChange={e => { setComment(e.target.value); setError(null); }}
                  placeholder="Descreva o motivo da alteração ou evidências de conformidade..."
                  rows={3}
                  className="text-xs"
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={saving} className="h-7 text-xs">
                  {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving} className="h-7 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
