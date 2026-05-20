"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, Square, Loader2 } from "lucide-react";

interface SurveyActionsProps {
  surveyId: string;
  currentStatus: string;
}

export function SurveyActions({ surveyId, currentStatus }: SurveyActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      await fetch(`/api/surveys/${surveyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === "DRAFT") {
    return (
      <Button onClick={() => updateStatus("ACTIVE")} disabled={loading} variant="success">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        Ativar Pesquisa
      </Button>
    );
  }

  if (currentStatus === "ACTIVE") {
    return (
      <Button onClick={() => updateStatus("CLOSED")} disabled={loading} variant="destructive">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
        Encerrar Pesquisa
      </Button>
    );
  }

  return null;
}
