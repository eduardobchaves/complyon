"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function DeleteCompanyButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/superadmin/companies/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao excluir empresa.");
      setLoading(false);
      return;
    }
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-[#9CA3AF] hover:text-red-400"
        onClick={() => { setError(null); setOpen(true); }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#1A1030] border border-purple-500/20 text-[#E9D5FF] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#E9D5FF]">Excluir empresa</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-[#9CA3AF]">
            Tem certeza que deseja excluir <span className="font-semibold text-[#E9D5FF]">{name}</span>?{" "}
            Todos os dados relacionados serão permanentemente removidos.
          </p>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
