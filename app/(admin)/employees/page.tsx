"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Users, Mail, Loader2, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Employee {
  id: string;
  name: string | null;
  email: string;
  role: string;
  active: boolean;
  invitedAt: string | null;
  createdAt: string;
}

const addSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["EMPLOYEE", "MANAGER", "ADMIN"]),
});

type AddData = z.infer<typeof addSchema>;

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MANAGER: "Gestor",
  EMPLOYEE: "Colaborador",
};

const isErased = (email: string) => email.endsWith("@removido.safemind");

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [eraseTarget, setEraseTarget] = useState<Employee | null>(null);
  const [erasing, setErasing] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<AddData>({
    resolver: zodResolver(addSchema),
    defaultValues: { role: "EMPLOYEE" },
  });

  const reload = () => fetch("/api/employees").then(r => r.json()).then(setEmployees);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const onAdd = async (data: AddData) => {
    setAddError(null);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) { setAddError(result.error || "Erro ao adicionar"); return; }
      await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email }),
      });
      await reload();
      setDialogOpen(false);
      reset();
    } catch {
      setAddError("Erro de conexão");
    }
  };

  const deactivate = async (id: string) => {
    await fetch(`/api/employees/${id}`, { method: "DELETE" });
    await reload();
  };

  const eraseData = async () => {
    if (!eraseTarget) return;
    setErasing(true);
    await fetch(`/api/employees/${eraseTarget.id}/erase`, { method: "POST" });
    await reload();
    setEraseTarget(null);
    setErasing(false);
  };

  const filtered = employees.filter(e =>
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    (e.name?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E9D5FF] font-[var(--font-sora)]">Colaboradores</h1>
          <p className="text-[#9CA3AF] mt-1">Gerencie os colaboradores da empresa</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Adicionar colaborador
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Badge variant="secondary">{employees.filter(e => e.active).length} ativos</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum colaborador encontrado"
              description="Adicione colaboradores para que eles possam participar das pesquisas."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Adicionado em</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name || "—"}</TableCell>
                    <TableCell className="text-[#9CA3AF]">
                      {isErased(emp.email) ? <span className="italic text-[#6B7280]">dados apagados</span> : emp.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{roleLabels[emp.role] || emp.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {emp.active ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Ativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <XCircle className="h-3.5 w-3.5" /> Inativo
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-[#9CA3AF] text-sm">
                      {new Date(emp.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {emp.active && !isErased(emp.email) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => deactivate(emp.id)}
                          >
                            Desativar
                          </Button>
                        )}
                        {!["ADMIN", "SUPER_ADMIN"].includes(emp.role) && !isErased(emp.email) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#6B7280] hover:text-red-400 hover:bg-red-500/10"
                            title="Apagar dados pessoais (LGPD Art. 18)"
                            onClick={() => setEraseTarget(emp)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add employee dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Colaborador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onAdd)}>
            <div className="space-y-4 py-4">
              {addError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  {addError}
                </div>
              )}
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input placeholder="João Silva" {...register("name")} />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="joao@empresa.com" {...register("email")} />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select defaultValue="EMPLOYEE" onValueChange={v => setValue("role", v as AddData["role"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Colaborador</SelectItem>
                    <SelectItem value="MANAGER">Gestor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {isSubmitting ? "Adicionando..." : "Adicionar e convidar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* LGPD erasure confirmation dialog */}
      <Dialog open={!!eraseTarget} onOpenChange={open => { if (!open) setEraseTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="h-5 w-5" />
              Apagar dados pessoais (LGPD)
            </DialogTitle>
            <DialogDescription className="text-[#9CA3AF] pt-2">
              Esta ação é <strong className="text-white">irreversível</strong>. Todos os dados pessoais de{" "}
              <strong className="text-[#E9D5FF]">{eraseTarget?.name || eraseTarget?.email}</strong> — nome e email — serão
              substituídos por um marcador anônimo, conforme exigido pelo Art. 18 da LGPD.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300 my-2">
            As respostas de pesquisa permanecem no sistema de forma anonimizada (sem vínculo com esta pessoa). O histórico de conformidade da empresa é preservado.
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEraseTarget(null)} disabled={erasing}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={eraseData} disabled={erasing}>
              {erasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {erasing ? "Apagando..." : "Apagar dados definitivamente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
