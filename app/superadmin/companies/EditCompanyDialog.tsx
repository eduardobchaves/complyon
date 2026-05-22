"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  adminEmail: z.string().email("Email inválido"),
  firstCode: z.string().min(4, "Código deve ter no mínimo 4 caracteres").max(32),
  maxEmployees: z.coerce.number().int().min(1, "Mínimo 1 colaborador"),
});

type FormData = z.infer<typeof schema>;

function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

interface Company {
  id: string;
  name: string;
  cnpj: string;
  adminEmail: string | null;
  firstCode: string | null;
  maxEmployees: number;
}

export function EditCompanyDialog({ company }: { company: Company }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: company.name,
      cnpj: formatCNPJ(company.cnpj),
      adminEmail: company.adminEmail ?? "",
      firstCode: company.firstCode ?? "",
      maxEmployees: company.maxEmployees,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: company.name,
        cnpj: formatCNPJ(company.cnpj),
        adminEmail: company.adminEmail ?? "",
        firstCode: company.firstCode ?? "",
        maxEmployees: company.maxEmployees,
      });
      setError(null);
    }
  }, [open, company, reset]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    const res = await fetch(`/api/superadmin/companies/${company.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, cnpj: data.cnpj.replace(/\D/g, "") }),
    });

    const result = await res.json();
    if (!res.ok) {
      setError(result.error || "Erro ao atualizar empresa.");
      return;
    }

    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9CA3AF] hover:text-[#E9D5FF]">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#1A1030] border border-purple-500/20 text-[#E9D5FF] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#E9D5FF] font-[var(--font-sora)]">Editar empresa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Nome da empresa</Label>
            <Input placeholder="Empresa Ltda." {...register("name")} />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>CNPJ</Label>
            <Input
              placeholder="00.000.000/0001-00"
              {...register("cnpj")}
              onChange={(e) => setValue("cnpj", formatCNPJ(e.target.value))}
            />
            {errors.cnpj && <p className="text-xs text-red-400">{errors.cnpj.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Email do administrador</Label>
            <Input type="email" placeholder="contato@empresa.com.br" {...register("adminEmail")} />
            {errors.adminEmail && <p className="text-xs text-red-400">{errors.adminEmail.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Código de ativação</Label>
            <div className="flex gap-2">
              <Input placeholder="Ex: ABC12345" {...register("firstCode")} className="font-mono" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setValue("firstCode", generateCode())}
                title="Gerar novo código"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {errors.firstCode && <p className="text-xs text-red-400">{errors.firstCode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Máximo de colaboradores</Label>
            <Input type="number" min={1} {...register("maxEmployees")} />
            {errors.maxEmployees && <p className="text-xs text-red-400">{errors.maxEmployees.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
