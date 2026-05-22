import { prisma } from "@/lib/prisma";

export interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  legalRef: string;
  status: "ok" | "pending" | "attention";
  detail?: string;
}

const BASE_ITEMS: Omit<ComplianceItem, "status" | "detail">[] = [
  {
    id: "1.1",
    title: "Identificação de perigos e avaliação de riscos psicossociais",
    description: "A empresa deve identificar os perigos e avaliar os riscos relacionados aos fatores psicossociais do trabalho.",
    legalRef: "NR-01 §1.5.3.1",
  },
  {
    id: "1.2",
    title: "Implementação de medidas de controle",
    description: "Implementar medidas de prevenção, minimização e controle dos riscos psicossociais identificados.",
    legalRef: "NR-01 §1.5.3.1-d",
  },
  {
    id: "1.3",
    title: "Plano de ação documentado",
    description: "Elaborar e documentar plano de ação para tratamento dos riscos psicossociais.",
    legalRef: "NR-01 §1.5.5.1",
  },
  {
    id: "1.4",
    title: "Monitoramento periódico dos riscos",
    description: "Realizar monitoramento contínuo e periódico das medidas implementadas e dos resultados obtidos.",
    legalRef: "NR-01 §1.5.4",
  },
  {
    id: "1.5",
    title: "Canal de denúncias e comunicação de riscos",
    description: "Disponibilizar canal para trabalhadores comunicarem situações de risco e denúncias de assédio.",
    legalRef: "NR-01 §1.4.3.2",
  },
  {
    id: "1.6",
    title: "Treinamento e informação aos trabalhadores",
    description: "Treinar trabalhadores sobre os riscos psicossociais e as medidas de prevenção adotadas.",
    legalRef: "NR-01 §1.4.1.1-c",
  },
  {
    id: "1.7",
    title: "Envolvimento dos trabalhadores no processo",
    description: "Garantir participação dos trabalhadores na identificação de perigos e avaliação de riscos.",
    legalRef: "NR-01 §1.4.3",
  },
  {
    id: "1.8",
    title: "Documentação e registros",
    description: "Manter documentação atualizada do gerenciamento de riscos psicossociais.",
    legalRef: "NR-01 §1.5.6",
  },
];

export interface ComplianceData {
  companyName: string;
  items: ComplianceItem[];
  okCount: number;
  attentionCount: number;
  compliancePct: number;
}

export async function getComplianceData(companyId: string): Promise<ComplianceData> {
  const [surveys, complaints, actionPlans, company] = await Promise.all([
    prisma.survey.findMany({
      where: { companyId },
      include: { _count: { select: { responses: true } } },
    }),
    prisma.complaint.findMany({ where: { companyId } }),
    prisma.actionPlan.findMany({ where: { companyId } }),
    prisma.company.findUnique({ where: { id: companyId } }),
  ]);

  const hasSurveyWithResponses = surveys.some(
    (s) => (s.status === "CLOSED" || s.status === "ARCHIVED") && s._count.responses > 0
  );
  const hasActionPlans = actionPlans.length > 0;
  const hasActiveSurvey = surveys.some((s) => s.status === "ACTIVE");
  const hasMonitoring = surveys.filter((s) => s.status !== "DRAFT").length >= 2;

  const items: ComplianceItem[] = [
    {
      ...BASE_ITEMS[0],
      status: hasSurveyWithResponses ? "ok" : hasActiveSurvey ? "pending" : "attention",
      detail: hasSurveyWithResponses
        ? `${surveys.filter((s) => s._count.responses > 0).length} pesquisa(s) realizadas`
        : "Realize uma pesquisa de clima para documentar a avaliação de riscos.",
    },
    {
      ...BASE_ITEMS[1],
      status: hasActionPlans ? "ok" : hasSurveyWithResponses ? "pending" : "attention",
      detail: hasActionPlans
        ? `${actionPlans.length} ação(ões) documentada(s)`
        : "Crie um plano de ação após a pesquisa de clima.",
    },
    {
      ...BASE_ITEMS[2],
      status: hasActionPlans ? "ok" : "attention",
      detail: hasActionPlans
        ? `Plano de ação registrado com ${actionPlans.length} item(ns)`
        : "Documente o plano de ação após identificar os riscos.",
    },
    {
      ...BASE_ITEMS[3],
      status: hasMonitoring ? "ok" : hasSurveyWithResponses ? "pending" : "attention",
      detail: hasMonitoring
        ? "Múltiplas pesquisas realizadas demonstram monitoramento contínuo"
        : "Realize pesquisas periódicas para demonstrar monitoramento.",
    },
    {
      ...BASE_ITEMS[4],
      status: "ok",
      detail: `${complaints.length} denúncia(s) registrada(s). Canal ativo e disponível.`,
    },
    {
      ...BASE_ITEMS[5],
      status: "pending",
      detail: "Documente os treinamentos realizados sobre riscos psicossociais e NR-01.",
    },
    {
      ...BASE_ITEMS[6],
      status: hasSurveyWithResponses ? "ok" : "pending",
      detail: hasSurveyWithResponses
        ? "Pesquisa participativa realizada com colaboradores"
        : "A pesquisa de clima garante participação dos colaboradores na identificação de riscos.",
    },
    {
      ...BASE_ITEMS[7],
      status: hasSurveyWithResponses && hasActionPlans ? "ok" : "pending",
      detail: "A plataforma ComplyOn mantém registros digitais de todas as pesquisas, respostas e planos de ação.",
    },
  ];

  const okCount = items.filter((i) => i.status === "ok").length;
  const attentionCount = items.filter((i) => i.status === "attention").length;
  const compliancePct = Math.round((okCount / items.length) * 100);

  return {
    companyName: company?.name ?? "Empresa",
    items,
    okCount,
    attentionCount,
    compliancePct,
  };
}
