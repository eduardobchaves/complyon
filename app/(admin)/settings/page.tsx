import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Shield } from "lucide-react";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const companyId = (session.user as { companyId: string }).companyId;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true, cnpj: true, slug: true, plan: true, createdAt: true },
  });

  if (!company) redirect("/login");

  const planLabels: Record<string, string> = {
    FREE: "Gratuito",
    ACTIVE: "Ativo",
    SUSPENDED: "Suspenso",
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#dcfce7] font-[var(--font-sora)]">Configurações</h1>
        <p className="mt-1 text-[#9CA3AF]">Informações da empresa e configurações da conta</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#9CA3AF] mb-1">Nome da empresa</p>
              <p className="text-sm font-medium text-[#dcfce7]">{company.name}</p>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF] mb-1">CNPJ</p>
              <p className="text-sm font-mono text-[#dcfce7]">{company.cnpj}</p>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF] mb-1">Plano atual</p>
              <Badge variant="default">{planLabels[company.plan] || company.plan}</Badge>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF] mb-1">Membro desde</p>
              <p className="text-sm text-[#dcfce7]">{new Date(company.createdAt).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-400" />
            Canal de Denúncias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-[#9CA3AF] mb-2">URL pública do canal de denúncias</p>
          <div className="flex items-center gap-3 rounded-lg bg-[#252d45] px-4 py-3">
            <code className="flex-1 text-sm text-green-300 font-mono break-all">
              {process.env.NEXT_PUBLIC_APP_URL || "https://complyon.com.br"}/denuncias/{company.slug}
            </code>
            <Link
              href={`/denuncias/${company.slug}`}
              target="_blank"
              className="text-green-400 hover:text-green-300"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-2 text-xs text-[#9CA3AF]">Compartilhe esta URL com seus colaboradores para denúncias anônimas</p>
        </CardContent>
      </Card>

      <Card className="border-amber-500/20">
        <CardContent className="pt-5">
          <p className="text-sm font-medium text-amber-300 mb-2">Conformidade Legal</p>
          <p className="text-xs text-[#9CA3AF]">
            Este sistema está em conformidade com a NR-01 (Portaria MTE nº 765/2025),
            Lei nº 14.831/2024 e LGPD. Todas as respostas e denúncias são anônimas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
