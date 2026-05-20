import { type SphereId, QUESTIONS, SPHERES } from "./questions";

export type ScoreResult = {
  sphereId: SphereId;
  sphereName: string;
  score: number;
  questionCount: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
};

/**
 * Calculate the score for a single sphere given a set of answers.
 * Answers is a Record<questionId, value> where value is 1, 3, 5, 7, or 10.
 */
export function calculateSphereScore(
  sphereId: SphereId,
  answers: Record<string, number>
): number {
  const sphereQuestions = QUESTIONS.filter(
    (q) => q.sphereId === sphereId && q.type === "likert"
  );

  if (sphereQuestions.length === 0) return 0;

  const validAnswers = sphereQuestions
    .map((q) => answers[q.id.toString()])
    .filter((v) => v !== undefined && v !== null);

  if (validAnswers.length === 0) return 0;

  const sum = validAnswers.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / validAnswers.length) * 10) / 10;
}

/**
 * Calculate scores for all spheres given a set of answers.
 */
export function calculateAllSphereScores(
  answers: Record<string, number>
): ScoreResult[] {
  return SPHERES.filter((s) =>
    QUESTIONS.some((q) => q.sphereId === s.id && q.type === "likert")
  ).map((sphere) => {
    const score = calculateSphereScore(sphere.id, answers);
    return {
      sphereId: sphere.id,
      sphereName: sphere.name,
      score,
      questionCount: QUESTIONS.filter(
        (q) => q.sphereId === sphere.id && q.type === "likert"
      ).length,
      riskLevel: getRiskLevel(score),
    };
  });
}

/**
 * Calculate overall organizational score from sphere scores.
 */
export function calculateOverallScore(sphereScores: ScoreResult[]): number {
  if (sphereScores.length === 0) return 0;
  const sum = sphereScores.reduce((acc, s) => acc + s.score, 0);
  return Math.round((sum / sphereScores.length) * 10) / 10;
}

/**
 * Calculate overall score from raw answers.
 */
export function calculateOverallScoreFromAnswers(
  answers: Record<string, number>
): number {
  const sphereScores = calculateAllSphereScores(answers);
  return calculateOverallScore(sphereScores);
}

/**
 * Get risk level based on score (1-10 scale).
 * Score >= 9: Ótimo / LOW
 * Score >= 7: Baixo Risco / LOW
 * Score >= 5: Risco Moderado / MODERATE
 * Score < 5: Alto Risco / HIGH
 */
export function getRiskLevel(score: number): "LOW" | "MODERATE" | "HIGH" {
  if (score >= 7) return "LOW";
  if (score >= 5) return "MODERATE";
  return "HIGH";
}

export function getRiskLabel(riskLevel: "LOW" | "MODERATE" | "HIGH"): string {
  switch (riskLevel) {
    case "LOW":
      return "Baixo Risco";
    case "MODERATE":
      return "Risco Moderado";
    case "HIGH":
      return "Alto Risco";
  }
}

export function getRiskLabelFromScore(score: number): string {
  if (score >= 9) return "Ótimo";
  if (score >= 7) return "Baixo Risco";
  if (score >= 5) return "Risco Moderado";
  return "Alto Risco";
}

export function getRiskColor(riskLevel: "LOW" | "MODERATE" | "HIGH"): string {
  switch (riskLevel) {
    case "LOW":
      return "#10B981";
    case "MODERATE":
      return "#F59E0B";
    case "HIGH":
      return "#EF4444";
  }
}

export function getScoreColor(score: number): string {
  if (score >= 9) return "#06B6D4";
  if (score >= 7) return "#10B981";
  if (score >= 5) return "#F59E0B";
  return "#EF4444";
}

export function getScoreColorClass(score: number): string {
  if (score >= 9) return "text-cyan-400";
  if (score >= 7) return "text-emerald-400";
  if (score >= 5) return "text-amber-400";
  return "text-red-400";
}

export function getBgColorClass(score: number): string {
  if (score >= 9) return "bg-cyan-400/20 border-cyan-400/30";
  if (score >= 7) return "bg-emerald-400/20 border-emerald-400/30";
  if (score >= 5) return "bg-amber-400/20 border-amber-400/30";
  return "bg-red-400/20 border-red-400/30";
}

/**
 * Aggregate scores from multiple responses.
 */
export function aggregateResponseScores(
  responsesScores: Record<string, number>[]
): Record<SphereId, number> {
  if (responsesScores.length === 0) {
    return {} as Record<SphereId, number>;
  }

  const sphereIds = SPHERES.map((s) => s.id);
  const result = {} as Record<SphereId, number>;

  for (const sphereId of sphereIds) {
    const scores = responsesScores
      .map((s) => s[sphereId])
      .filter((v) => v !== undefined && v !== null);

    if (scores.length > 0) {
      result[sphereId] =
        Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
        10;
    }
  }

  return result;
}
