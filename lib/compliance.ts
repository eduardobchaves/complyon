export interface ComplianceBaseItem {
  id: string;
  title: string;
  description: string;
  legalRef: string;
  status: "ok" | "pending" | "attention";
  detail: string;
}

export const BASE_ITEMS: ComplianceBaseItem[] = [
  {
    id: "1.1",
    title: "Identificação de perigos e avaliação de riscos psicossociais",
    description: "A empresa deve identificar os perigos e avaliar os riscos relacionados aos fatores psicossociais do trabalho.",
    legalRef: "NR-01 §1.5.3.1",
    status: "attention",
    detail: "Realize uma pesquisa de clima para documentar a avaliação de riscos.",
  },
  {
    id: "1.2",
    title: "Implementação de medidas de controle",
    description: "Implementar medidas de prevenção, minimização e controle dos riscos psicossociais identificados.",
    legalRef: "NR-01 §1.5.3.1-d",
    status: "attention",
    detail: "Crie um plano de ação após a pesquisa de clima.",
  },
  {
    id: "1.3",
    title: "Plano de ação documentado",
    description: "Elaborar e documentar plano de ação para tratamento dos riscos psicossociais.",
    legalRef: "NR-01 §1.5.5.1",
    status: "attention",
    detail: "Documente o plano de ação após identificar os riscos.",
  },
  {
    id: "1.4",
    title: "Monitoramento periódico dos riscos",
    description: "Realizar monitoramento contínuo e periódico das medidas implementadas e dos resultados obtidos.",
    legalRef: "NR-01 §1.5.4",
    status: "attention",
    detail: "Realize pesquisas periódicas para demonstrar monitoramento.",
  },
  {
    id: "1.5",
    title: "Canal de denúncias e comunicação de riscos",
    description: "Disponibilizar canal para trabalhadores comunicarem situações de risco e denúncias de assédio.",
    legalRef: "NR-01 §1.4.3.2",
    status: "ok",
    detail: "Canal ativo e disponível.",
  },
  {
    id: "1.6",
    title: "Treinamento e informação aos trabalhadores",
    description: "Treinar trabalhadores sobre os riscos psicossociais e as medidas de prevenção adotadas.",
    legalRef: "NR-01 §1.4.1.1-c",
    status: "pending",
    detail: "Documente os treinamentos realizados sobre riscos psicossociais e NR-01.",
  },
  {
    id: "1.7",
    title: "Envolvimento dos trabalhadores no processo",
    description: "Garantir participação dos trabalhadores na identificação de perigos e avaliação de riscos.",
    legalRef: "NR-01 §1.4.3",
    status: "pending",
    detail: "A pesquisa de clima garante participação dos colaboradores na identificação de riscos.",
  },
  {
    id: "1.8",
    title: "Documentação e registros",
    description: "Manter documentação atualizada do gerenciamento de riscos psicossociais.",
    legalRef: "NR-01 §1.5.6",
    status: "pending",
    detail: "A plataforma ComplyOn mantém registros digitais de todas as pesquisas, respostas e planos de ação.",
  },
];
