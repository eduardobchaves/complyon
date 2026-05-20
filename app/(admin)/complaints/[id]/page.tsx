"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";

const categoryLabels: Record<string, string> = {
  MORAL_HARASSMENT: "Assédio Moral",
  SEXUAL_HARASSMENT: "Assédio Sexual",
  FRAUD_CORRUPTION: "Fraude / Corrupção",
  NORM_VIOLATION: "Violação de Normas",
  INTERPERSONAL_CONFLICT: "Conflito Interpessoal",
  DISCRIMINATION: "Discriminação",
  OTHER: "Outro",
};

const statusConfig: Record<string, { label: string; variant: "warning" | "info" | "success" }> = {
  OPEN: { label: "Aberta", variant: "warning" },
  UNDER_REVIEW: { label: "Em análise", variant: "info" },
  COMPLETED: { label: "Concluída", variant: "success" },
};

interface Complaint {
  id: string;
  protocol: string;
  category: string;
  description: string;
  status: string;
  notes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  completedAt: string | null;
}

export default function ComplaintDetailPage() {
  const params = useParams();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/complaints/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setComplaint(data);
        setNotes(data.notes || "");
        setStatus(data.status);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/complaints/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!complaint) {
    return <p className="text-[#9CA3AF]">Denúncia não encontrada.</p>;
  }

  const statusInfo = statusConfig[complaint.status] || { label: complaint.status, variant: "secondary" as "warning" };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/complaints">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#E9D5FF] font-[var(--font-sora)]">
            Denúncia
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-sm text-purple-400">{complaint.protocol}</span>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
        </div>
      </div>

      {/* Complaint details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-purple-400" />
            Detalhes da Denúncia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-[#9CA3AF] mb-1">Categoria</p>
            <p className="text-sm font-medium text-[#E9D5FF]">
              {categoryLabels[complaint.category] || complaint.category}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] mb-1">Descrição</p>
            <div className="bg-[#221540] rounded-lg p-4 text-sm text-[#E9D5FF] leading-relaxed">
              {complaint.description}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-[#9CA3AF] mb-1">Recebida em</p>
              <p className="text-[#E9D5FF]">
                {new Date(complaint.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {complaint.reviewedAt && (
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Revisada em</p>
                <p className="text-[#E9D5FF]">
                  {new Date(complaint.reviewedAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Update form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Atualizar Denúncia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Aberta</SelectItem>
                <SelectItem value="UNDER_REVIEW">Em análise</SelectItem>
                <SelectItem value="COMPLETED">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notas internas (não visíveis ao denunciante)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Registre as providências tomadas..."
              rows={5}
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar alterações"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
