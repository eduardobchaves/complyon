"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, ClipboardList } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewSurveyPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao criar pesquisa");
        return;
      }

      router.push(`/surveys/${result.id}`);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/surveys">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#dcfce7] font-[var(--font-sora)]">
            Nova Pesquisa
          </h1>
          <p className="text-[#9CA3AF] mt-1">Crie uma pesquisa de clima organizacional</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-green-400" />
            Detalhes da Pesquisa
          </CardTitle>
          <CardDescription>
            Defina o título e o período de coleta. A pesquisa ficará em rascunho até você ativá-la.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Título da pesquisa *</Label>
              <Input
                id="title"
                placeholder="Ex: Pesquisa de Clima Q1 2025"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-red-400">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva o objetivo desta pesquisa..."
                rows={3}
                {...register("description")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de início</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data de encerramento</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                />
              </div>
            </div>

            <div className="bg-[#252d45] rounded-lg p-4 text-sm text-[#9CA3AF]">
              <p className="font-medium text-[#dcfce7] mb-2">📋 O que será aplicado:</p>
              <ul className="space-y-1">
                <li>• 21 perguntas de escala Likert em 8 esferas</li>
                <li>• 4 questões abertas e especiais</li>
                <li>• Total: 26 questões, ~5 minutos para responder</li>
                <li>• Respostas 100% anônimas — nenhum dado identificador armazenado</li>
              </ul>
            </div>
          </CardContent>

          <div className="px-6 pb-6 flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Criando..." : "Criar pesquisa"}
            </Button>
            <Link href="/surveys">
              <Button variant="ghost">Cancelar</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
