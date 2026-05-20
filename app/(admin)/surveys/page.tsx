import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Plus, ClipboardList, Users, Calendar, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "secondary" | "warning" }> = {
  DRAFT: { label: "Rascunho", variant: "secondary" },
  ACTIVE: { label: "Ativa", variant: "success" },
  CLOSED: { label: "Encerrada", variant: "warning" },
  ARCHIVED: { label: "Arquivada", variant: "secondary" },
};

export default async function SurveysPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const companyId = (session.user as { companyId: string }).companyId;

  const surveys = await prisma.survey.findMany({
    where: { companyId },
    include: { _count: { select: { responses: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalEmployees = await prisma.user.count({ where: { companyId, active: true } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E9D5FF] font-[var(--font-sora)]">Pesquisas</h1>
          <p className="text-[#9CA3AF] mt-1">Gerencie suas pesquisas de clima organizacional</p>
        </div>
        <Link href="/surveys/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nova Pesquisa
          </Button>
        </Link>
      </div>

      {surveys.length === 0 ? (
        <Card>
          <CardContent className="py-0">
            <EmptyState
              icon={ClipboardList}
              title="Nenhuma pesquisa criada"
              description="Crie sua primeira pesquisa de clima para começar a coletar dados."
              action={
                <Link href="/surveys/new">
                  <Button>Criar pesquisa</Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {surveys.map((survey) => {
            const responseRate = totalEmployees > 0
              ? Math.round((survey._count.responses / totalEmployees) * 100)
              : 0;
            const statusInfo = statusConfig[survey.status] || { label: survey.status, variant: "secondary" as const };

            return (
              <Card key={survey.id} className="hover:border-purple-500/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-[#E9D5FF] font-[var(--font-sora)]">
                          {survey.title}
                        </h3>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                      {survey.description && (
                        <p className="text-sm text-[#9CA3AF] mb-3">{survey.description}</p>
                      )}
                      <div className="flex items-center gap-6 text-sm text-[#9CA3AF]">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          <span>{survey._count.responses} respostas ({responseRate}%)</span>
                        </div>
                        {survey.startDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {new Date(survey.startDate).toLocaleDateString("pt-BR")}
                              {survey.endDate && ` - ${new Date(survey.endDate).toLocaleDateString("pt-BR")}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {survey.status === "CLOSED" || survey.status === "ARCHIVED" ? (
                        <Link href={`/surveys/${survey.id}`}>
                          <Button variant="outline" size="sm">
                            <BarChart2 className="h-4 w-4" />
                            Ver Resultados
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/surveys/${survey.id}`}>
                          <Button variant="outline" size="sm">Gerenciar</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
