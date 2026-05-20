export type SphereId =
  | "lideranca"
  | "cultura"
  | "estresse"
  | "inclusao"
  | "carreira"
  | "psicologica"
  | "assedio"
  | "bemestar";

export interface Sphere {
  id: SphereId;
  name: string;
  description: string;
  icon: string;
}

export interface Question {
  id: number;
  sphereId: SphereId | null;
  text: string;
  type: "likert" | "open" | "yesno" | "multiselect";
  options?: string[];
}

export const SPHERES: Sphere[] = [
  {
    id: "lideranca",
    name: "Liderança",
    description: "Qualidade da liderança e gestão",
    icon: "👥",
  },
  {
    id: "cultura",
    name: "Cultura Organizacional",
    description: "Valores e ambiente de trabalho",
    icon: "🏢",
  },
  {
    id: "estresse",
    name: "Carga e Estresse",
    description: "Equilíbrio entre demandas e capacidade",
    icon: "⚡",
  },
  {
    id: "inclusao",
    name: "Inclusão e Diversidade",
    description: "Respeito e equidade",
    icon: "🤝",
  },
  {
    id: "carreira",
    name: "Carreira e Crescimento",
    description: "Oportunidades de desenvolvimento",
    icon: "📈",
  },
  {
    id: "psicologica",
    name: "Segurança Psicológica",
    description: "Confiança para se expressar",
    icon: "🧠",
  },
  {
    id: "assedio",
    name: "Assédio e Conflitos",
    description: "Ambiente livre de assédio",
    icon: "🛡️",
  },
  {
    id: "bemestar",
    name: "Bem-estar Geral",
    description: "Saúde e qualidade de vida no trabalho",
    icon: "💚",
  },
];

export const QUESTIONS: Question[] = [
  // Liderança (1-3)
  {
    id: 1,
    sphereId: "lideranca",
    text: "Meu líder direto me trata com respeito e considera minhas opiniões.",
    type: "likert",
  },
  {
    id: 2,
    sphereId: "lideranca",
    text: "Recebo feedbacks claros e construtivos sobre meu desempenho.",
    type: "likert",
  },
  {
    id: 3,
    sphereId: "lideranca",
    text: "Minha liderança apoia meu desenvolvimento profissional.",
    type: "likert",
  },

  // Cultura Organizacional (4-6)
  {
    id: 4,
    sphereId: "cultura",
    text: "A empresa valoriza o bem-estar dos colaboradores em suas decisões.",
    type: "likert",
  },
  {
    id: 5,
    sphereId: "cultura",
    text: "Existe uma cultura de reconhecimento e valorização do trabalho.",
    type: "likert",
  },
  {
    id: 6,
    sphereId: "cultura",
    text: "A comunicação interna é transparente e eficaz.",
    type: "likert",
  },

  // Carga e Estresse (7-9)
  {
    id: 7,
    sphereId: "estresse",
    text: "Consigo concluir minhas tarefas dentro do horário de trabalho habitual.",
    type: "likert",
  },
  {
    id: 8,
    sphereId: "estresse",
    text: "O volume de trabalho é adequado à minha capacidade.",
    type: "likert",
  },
  {
    id: 9,
    sphereId: "estresse",
    text: "Consigo me desconectar do trabalho fora do horário de expediente.",
    type: "likert",
  },

  // Inclusão e Diversidade (10-12)
  {
    id: 10,
    sphereId: "inclusao",
    text: "Todas as pessoas são tratadas com igualdade independente de gênero, raça ou origem.",
    type: "likert",
  },
  {
    id: 11,
    sphereId: "inclusao",
    text: "Sinto que tenho as mesmas oportunidades que meus colegas.",
    type: "likert",
  },
  {
    id: 12,
    sphereId: "inclusao",
    text: "A empresa promove ativamente um ambiente diverso e inclusivo.",
    type: "likert",
  },

  // Carreira e Crescimento (13-15)
  {
    id: 13,
    sphereId: "carreira",
    text: "Tenho clareza sobre meu plano de carreira na empresa.",
    type: "likert",
  },
  {
    id: 14,
    sphereId: "carreira",
    text: "A empresa oferece oportunidades de treinamento e desenvolvimento.",
    type: "likert",
  },
  {
    id: 15,
    sphereId: "carreira",
    text: "Me sinto motivado(a) e engajado(a) com meu trabalho.",
    type: "likert",
  },

  // Segurança Psicológica (16-18)
  {
    id: 16,
    sphereId: "psicologica",
    text: "Me sinto à vontade para expressar minhas opiniões sem medo de retaliação.",
    type: "likert",
  },
  {
    id: 17,
    sphereId: "psicologica",
    text: "Posso reportar problemas ou erros sem medo de consequências negativas.",
    type: "likert",
  },
  {
    id: 18,
    sphereId: "psicologica",
    text: "Minha equipe cria um ambiente onde posso ser autêntico(a).",
    type: "likert",
  },

  // Assédio e Conflitos (19-21)
  {
    id: 19,
    sphereId: "assedio",
    text: "Nunca presenciei ou sofri situações de assédio moral no trabalho.",
    type: "likert",
  },
  {
    id: 20,
    sphereId: "assedio",
    text: "Conflitos interpessoais são tratados de forma justa e construtiva.",
    type: "likert",
  },
  {
    id: 21,
    sphereId: "assedio",
    text: "A empresa possui canais seguros para reportar situações de assédio.",
    type: "likert",
  },

  // Questões abertas e especiais (22-26)
  {
    id: 22,
    sphereId: "bemestar",
    text: "Como você avalia seu nível de bem-estar geral no trabalho?",
    type: "likert",
  },
  {
    id: 23,
    sphereId: null,
    text: "Quais são os principais fatores que impactam positivamente sua experiência de trabalho?",
    type: "open",
  },
  {
    id: 24,
    sphereId: null,
    text: "Quais são os principais desafios ou pontos de melhoria que você identifica?",
    type: "open",
  },
  {
    id: 25,
    sphereId: null,
    text: "Você recomendaria esta empresa como um bom lugar para trabalhar?",
    type: "yesno",
    options: ["Sim, definitivamente", "Sim, com ressalvas", "Não tenho certeza", "Não recomendaria"],
  },
  {
    id: 26,
    sphereId: null,
    text: "Há algo mais que gostaria de compartilhar sobre sua experiência na empresa?",
    type: "open",
  },
];

export const LIKERT_SCALE = [
  { value: 1, label: "Discordo totalmente" },
  { value: 3, label: "Discordo parcialmente" },
  { value: 5, label: "Nem concordo, nem discordo" },
  { value: 7, label: "Concordo parcialmente" },
  { value: 10, label: "Concordo totalmente" },
];

export function getQuestionsBySphere(sphereId: SphereId): Question[] {
  return QUESTIONS.filter((q) => q.sphereId === sphereId);
}

export function getLikertQuestions(): Question[] {
  return QUESTIONS.filter((q) => q.type === "likert");
}

export function getOpenQuestions(): Question[] {
  return QUESTIONS.filter((q) => q.type !== "likert");
}
