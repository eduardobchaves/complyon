"use client";

import { useEffect, useState } from "react";
import { ComplianceChecklist } from "./ComplianceChecklist";
import type { ComplianceItem } from "@/types/index";

interface Override {
  status: "ok" | "pending" | "attention";
  comment: string;
}

interface Props {
  items: ComplianceItem[];
}

export function ComplianceListClient({ items }: Props) {
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverrides();
  }, []);

  const loadOverrides = async () => {
    try {
      const res = await fetch("/api/compliance");
      if (res.ok) {
        const data = await res.json();
        const overridesMap = data.reduce(
          (acc: Record<string, Override>, override: { itemId: string; status: string; comment: string }) => {
            acc[override.itemId] = {
              status: override.status as "ok" | "pending" | "attention",
              comment: override.comment,
            };
            return acc;
          },
          {}
        );
        setOverrides(overridesMap);
      }
    } catch (error) {
      console.error("Erro ao carregar overrides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideChange = (itemId: string, override: Override) => {
    setOverrides((prev) => ({
      ...prev,
      [itemId]: override,
    }));
  };

  if (loading) {
    return <div className="text-[#9CA3AF] text-sm">Carregando...</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ComplianceChecklist
          key={item.id}
          item={item}
          override={overrides[item.id]}
          onOverrideChange={handleOverrideChange}
        />
      ))}
    </div>
  );
}
