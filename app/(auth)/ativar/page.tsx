"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z
  .object({
    email: z.string().email("Email inválido"),
    firstCode: z.string().min(1, "Código obrigatório"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function AtivarPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) setValue("firstCode", code);
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, firstCode: data.firstCode, password: data.password }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Erro ao ativar conta.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError("Erro ao conectar com o servidor. Tente novamente.");
      console.error("Erro ao ativar:", err);
    }
  };

  if (success) {
    return (
      <Card className="border border-emerald-500/20 bg-[#1A1030]">
        <CardContent className="pt-8 pb-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#E9D5FF] mb-2">Conta ativada com sucesso!</h3>
          <p className="text-[#9CA3AF]">Redirecionando para o login...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-purple-500/20 bg-[#1A1030]">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="h-5 w-5 text-purple-400" />
          <CardTitle className="text-2xl font-bold text-[#E9D5FF] font-[var(--font-sora)]">
            Ativar acesso
          </CardTitle>
        </div>
        <CardDescription className="text-[#9CA3AF]">
          Use o código recebido para criar sua conta.
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
            <Label htmlFor="email">Seu email</Label>
            <Input id="email" type="email" placeholder="voce@empresa.com.br" {...register("email")} />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstCode">Código de ativação</Label>
            <Input id="firstCode" placeholder="Código fornecido pela ComplyOn" className="font-mono tracking-widest" {...register("firstCode")} />
            {errors.firstCode && <p className="text-xs text-red-400">{errors.firstCode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Criar senha</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Mínimo 8 caracteres" className="pr-10" {...register("password")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input id="confirmPassword" type="password" placeholder="Repetir senha" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {isSubmitting ? "Ativando..." : "Ativar conta"}
          </Button>

          <p className="text-center text-sm text-[#9CA3AF]">
            Já tem conta?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
