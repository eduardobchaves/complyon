import type { SphereId } from "./questions";

type RiskLevel = "LOW" | "MODERATE" | "HIGH";

export const AUTO_RECOMMENDATIONS: Record<SphereId, Record<RiskLevel, string>> = {
  lideranca: {
    HIGH: "Implementar programa de desenvolvimento de liderança empática. Criar rituais de 1:1 semanais. Treinar gestores em comunicação não-violenta. Estabelecer avaliação 360° semestral.",
    MODERATE: "Reforçar treinamentos de feedback construtivo. Criar canais de comunicação direta entre líderes e equipes. Incentivar reconhecimento público de boas práticas.",
    LOW: "Manter práticas atuais de liderança. Monitorar continuidade nas próximas pesquisas.",
  },
  cultura: {
    HIGH: "Revisar e comunicar valores organizacionais. Criar comitê de cultura com representantes de todos os setores. Implementar programa de integração e pertencimento.",
    MODERATE: "Fortalecer rituais de integração. Criar espaços de escuta entre equipes. Realizar workshops de alinhamento cultural bimestrais.",
    LOW: "Manter iniciativas culturais atuais. Incluir cultura como pauta fixa nas reuniões de liderança.",
  },
  estresse: {
    HIGH: "URGENTE: Auditar carga de trabalho por setor. Disponibilizar apoio psicológico imediato (EAP). Criar política de desconexão digital. Revisar metas e prazos. Ação obrigatória conforme NR-01 §1.5.5.1.",
    MODERATE: "Avaliar redistribuição de demandas. Implementar pausas estruturadas. Oferecer acesso a suporte psicológico. Treinar gestores em sinais de burnout.",
    LOW: "Monitorar indicadores de absenteísmo. Manter programas de bem-estar e qualidade de vida.",
  },
  inclusao: {
    HIGH: "Implementar política formal de diversidade e inclusão. Treinar todos os colaboradores. Criar grupo de afinidade. Revisar processos seletivos para redução de vieses.",
    MODERATE: "Reforçar treinamentos sobre diversidade. Mapear barreiras de inclusão por área. Criar métricas de acompanhamento de diversidade.",
    LOW: "Manter práticas inclusivas. Compartilhar resultados positivos com a equipe.",
  },
  carreira: {
    HIGH: "Criar plano de carreira formal por função. Implementar programa de mentoria. Estabelecer trilhas de desenvolvimento individualizadas. Revisar política de promoção.",
    MODERATE: "Estruturar feedbacks de desenvolvimento semestrais. Mapear gaps de competências. Oferecer acesso a plataformas de aprendizagem.",
    LOW: "Manter programas de desenvolvimento. Celebrar conquistas e progressos da equipe.",
  },
  psicologica: {
    HIGH: "URGENTE: Criar ambiente de segurança psicológica via liderança exemplar. Garantir proteção total a quem reporta (NR-01 §1.4.3.2). Treinar gestores em escuta ativa e gestão sem intimidação.",
    MODERATE: "Realizar workshops de feedback seguro. Criar espaços anônimos para sugestões. Reforçar política de não-retaliação.",
    LOW: "Manter cultura de abertura. Compartilhar casos de uso bem-sucedido do canal de sugestões.",
  },
  assedio: {
    HIGH: "URGENTE: Ativar protocolo de investigação imediata. Revisar e comunicar política de assédio. Treinar toda a liderança. Ação obrigatória conforme NR-01 §1.4.1.1.",
    MODERATE: "Reforçar canal de denúncias. Realizar treinamento obrigatório de conduta e respeito. Revisar política interna de combate ao assédio.",
    LOW: "Manter treinamentos anuais sobre assédio conforme NR-01 §1.4.1.1-c. Comunicar proativamente os canais disponíveis.",
  },
  bemestar: {
    HIGH: "Revisar benefícios de saúde. Implementar programa de bem-estar (mental, físico, financeiro). Criar política de flexibilidade de horário/trabalho remoto.",
    MODERATE: "Ampliar benefícios de saúde mental. Realizar ações de qualidade de vida mensais. Pesquisar necessidades específicas por área.",
    LOW: "Manter e comunicar benefícios disponíveis. Criar calendário de ações de bem-estar.",
  },
};

export function getRecommendation(sphereId: SphereId, riskLevel: RiskLevel): string {
  return AUTO_RECOMMENDATIONS[sphereId][riskLevel];
}
