"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

export function DeleteSurveyButton({ surveyId, surveyTitle }: { surveyId: string; surveyTitle: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar pesquisa");
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      alert("Erro ao deletar pesquisa. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-red-500 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-[#E9D5FF]">Deletar pesquisa</h2>
              <p className="text-sm text-[#9CA3AF] mt-2">
                Tem certeza que deseja deletar a pesquisa "<strong>{surveyTitle}</strong>"? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-[#374151]">
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                size="sm"
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? "Deletando..." : "Deletar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
