"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Shield, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

const schema = z.object({
  category: z.enum(["MORAL_HARASSMENT","SEXUAL_HARASSMENT","FRAUD_CORRUPTION","NORM_VIOLATION","INTERPERSONAL_CONFLICT","DISCRIMINATION","OTHER"]),
  description: z.string().min(20, "Descreva a situação com pelo menos 20 caracteres").max(5000),
});

type FormData = z.infer<typeof schema>;

const CATEGORY_OPTIONS = [
  { value: "MORAL_HARASSMENT", label: "Assédio Moral" },
  { value: "SEXUAL_HARASSMENT", label: "Assédio Sexual" },
  { value: "DISCRIMINATION", label: "Discriminação" },
  { value: "INTERPERSONAL_CONFLICT", label: "Conflito Interpessoal" },
  { value: "NORM_VIOLATION", label: "Violação de Normas" },
  { value: "FRAUD_CORRUPTION", label: "Fraude ou Corrupção" },
  { value: "OTHER", label: "Outro" },
];

export default function PublicComplaintPage() {
  const { slug } = useParams() as { slug: string };
  const [protocol, setProtocol] = useState<string | null>(null);
  const [categoryValue, setCategoryValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companySlug: slug, ...data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao enviar");
      setProtocol(json.protocol);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar denúncia");
    }
  };

  if (protocol) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-[#dcfce7] mb-2 font-[var(--font-sora)]">Denúncia Registrada</h2>
            <p className="text-[#9CA3AF] text-sm mb-5">
              Sua denúncia foi registrada com sucesso. Guarde o número de protocolo para acompanhar o andamento.
            </p>
            <div className="rounded-xl bg-[#252d45] border border-green-600/20 px-6 py-4 mb-5">
              <p className="text-xs text-[#9CA3AF] mb-1">Número de Protocolo</p>
              <p className="text-2xl font-bold text-green-300 font-mono tracking-widest">{protocol}</p>
            </div>
            <p className="text-xs text-[#9CA3AF] mb-4">
              Use este protocolo em <strong className="text-green-400">/denuncias/status</strong> para consultar o andamento.
            </p>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
              🔒 Sua identidade é completamente protegida. Nenhum dado identificador foi armazenado.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <header className="border-b border-green-600/20 bg-[#1e2438]">
        <div className="mx-auto max-w-2xl flex items-center gap-3 px-4 py-4">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-[#dcfce7] font-[var(--font-sora)]">Canal de Denúncias — ComplyOn</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#dcfce7] font-[var(--font-sora)]">Canal de Denúncias</h1>
          <p className="mt-1 text-[#9CA3AF]">Reporte situações de assédio, discriminação ou irregularidades de forma anônima e segura.</p>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-green-600/20 bg-[#1e2438] p-4 flex items-start gap-3">
            <Shield className="h-5 w-5 shrink-0 text-green-400 mt-0.5" />
            <div className="text-sm text-[#9CA3AF]">
              <p className="font-medium text-[#dcfce7] mb-1">Garantia de Anonimato</p>
              <p>Sua identidade é completamente protegida. Não armazenamos IP, dispositivo ou qualquer dado que possa identificá-lo(a). Sua denúncia é tratada com absoluta confidencialidade.</p>
            </div>
          </div>

          {/* LGPD transparency notice — Art. 9 */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2 text-xs text-[#9CA3AF]">
            <p className="font-medium text-[#dcfce7] text-sm">Aviso de Privacidade (LGPD — Lei 13.709/2018)</p>
            <ul className="space-y-1.5 list-none">
              <li><strong className="text-[#86efac]">Dados coletados:</strong> apenas a categoria e a descrição que você informar. Nenhum dado pessoal identificável é coletado ou armazenado.</li>
              <li><strong className="text-[#86efac]">Finalidade:</strong> investigação interna de irregularidades e cumprimento das obrigações legais da empresa.</li>
              <li><strong className="text-[#86efac]">Base legal:</strong> cumprimento de obrigação legal (Art. 7º, II) e legítimo interesse na proteção de direitos (Art. 7º, IX).</li>
              <li><strong className="text-[#86efac]">Acesso:</strong> somente o(s) administrador(es) responsável(is) designado(s) pela empresa têm acesso ao conteúdo desta denúncia.</li>
              <li><strong className="text-[#86efac]">Retenção:</strong> a denúncia é mantida pelo prazo necessário à investigação e ao prazo prescricional trabalhista (até 5 anos).</li>
              <li><strong className="text-[#86efac]">Seus direitos (Art. 18):</strong> como a denúncia é anônima, não é possível vinculá-la a uma identidade. Para exercer direitos de acesso ou exclusão, entre em contato com o encarregado de dados da empresa.</li>
            </ul>
            <p className="pt-1">
              <a href="/privacidade" className="underline hover:text-green-400" target="_blank" rel="noreferrer">
                Política de Privacidade completa
              </a>
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2 text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              <strong>Atenção:</strong> Evite incluir informações que possam identificar você, como seu nome, cargo, departamento ou detalhes muito específicos sobre sua rotina. Descreva os fatos sem se expor.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Registrar Denúncia
            </CardTitle>
            <CardDescription>Todos os campos são obrigatórios</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label>Tipo de denúncia *</Label>
                <Select
                  value={categoryValue}
                  onValueChange={v => {
                    setCategoryValue(v);
                    setValue("category", v as FormData["category"]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-red-400">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Descrição detalhada *</Label>
                <Textarea
                  placeholder="Descreva a situação com o máximo de detalhes possível: o que aconteceu, quando, onde e quem estava envolvido (sem precisar se identificar)..."
                  rows={6}
                  {...register("description")}
                />
                {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                {isSubmitting ? "Enviando..." : "Enviar Denúncia de Forma Anônima"}
              </Button>

              <p className="text-center text-xs text-[#6B7280]">
                Ao enviar, você receberá um número de protocolo para acompanhar o status da sua denúncia.
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
