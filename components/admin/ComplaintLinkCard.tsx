"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, MessageSquare } from "lucide-react";

export function ComplaintLinkCard({ slug }: { slug: string }) {
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/denuncias/${slug}`;
  const displayUrl = `/denuncias/${slug}`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/denuncias/${slug}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-amber-500/20 bg-amber-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-amber-300">
          <MessageSquare className="h-4 w-4" />
          Canal de Denúncias — Link Público
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-[#9CA3AF]">
          Distribua este link a todos os colaboradores. Qualquer pessoa com o link pode registrar uma denúncia anônima a qualquer momento, sem precisar de login.
        </p>
        <div className="flex items-center gap-2 rounded-lg bg-[#1a1a2e] border border-white/10 px-3 py-2">
          <span className="flex-1 truncate text-sm font-mono text-[#9CA3AF]">{displayUrl}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={copy}>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <a href={`/denuncias/${slug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
        <p className="text-xs text-[#6B7280]">
          🔒 Nenhum dado identificador é armazenado. Anonimato total garantido.
        </p>
      </CardContent>
    </Card>
  );
}
