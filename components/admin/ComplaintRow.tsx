"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplaintRowProps {
  complaint: {
    id: string;
    protocol: string;
    category: string;
    status: string;
    createdAt: string | Date;
    description: string;
  };
}

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

export function ComplaintRow({ complaint }: ComplaintRowProps) {
  const statusInfo = statusConfig[complaint.status] || { label: complaint.status, variant: "secondary" as "warning" };

  return (
    <TableRow>
      <TableCell>
        <span className="font-mono text-xs text-green-400">{complaint.protocol}</span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-[#dcfce7]">
          {categoryLabels[complaint.category] || complaint.category}
        </span>
      </TableCell>
      <TableCell>
        <p className="text-sm text-[#9CA3AF] truncate max-w-xs">
          {complaint.description.slice(0, 80)}...
        </p>
      </TableCell>
      <TableCell>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm text-[#9CA3AF]">
          {new Date(complaint.createdAt).toLocaleDateString("pt-BR")}
        </span>
      </TableCell>
      <TableCell>
        <Link
          href={`/complaints/${complaint.id}`}
          className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
        >
          Ver
          <ExternalLink className="h-3 w-3" />
        </Link>
      </TableCell>
    </TableRow>
  );
}
