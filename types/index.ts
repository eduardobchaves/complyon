import type { SphereId } from "@/lib/questions";

export type { SphereId };

export interface SphereScore {
  sphereId: SphereId;
  sphereName: string;
  score: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  questionCount: number;
}

export interface SurveyStats {
  id: string;
  title: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  totalResponses: number;
  totalInvited: number;
  responseRate: number;
  overallScore: number;
  sphereScores: SphereScore[];
  createdAt: Date;
}

export interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  legalRef: string;
  status: "ok" | "pending" | "attention";
  detail?: string;
}

export interface DashboardStats {
  overallScore: number;
  responseRate: number;
  totalRespondents: number;
  openComplaints: number;
  sphereScores: SphereScore[];
  highRiskSpheres: SphereScore[];
  activeSurvey: {
    id: string;
    title: string;
    endDate: Date | null;
  } | null;
}

export interface ActionPlanItem {
  id: string;
  sphereId: SphereId;
  sphereName: string;
  score: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  recommendation: string;
  responsible: string | null;
  deadline: Date | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes: string | null;
}
