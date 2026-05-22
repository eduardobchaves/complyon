import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SurveyFormClient } from "./SurveyFormClient";

export const dynamic = "force-dynamic";

export default async function TokenSurveyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const surveyToken = await prisma.surveyToken.findUnique({
    where: { token },
    include: { survey: true },
  });

  if (!surveyToken) notFound();

  if (surveyToken.used) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-[#E9D5FF] font-[var(--font-sora)] mb-3">
            Link já utilizado
          </h1>
          <p className="text-[#9CA3AF]">
            Este link de pesquisa já foi utilizado. Cada link é de uso único para garantir o anonimato.
          </p>
        </div>
      </div>
    );
  }

  if (surveyToken.survey.status !== "ACTIVE") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-[#E9D5FF] font-[var(--font-sora)] mb-3">
            Pesquisa indisponível
          </h1>
          <p className="text-[#9CA3AF]">
            Esta pesquisa não está mais ativa. Entre em contato com o administrador da sua empresa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <SurveyFormClient
          surveyId={surveyToken.survey.id}
          surveyTitle={surveyToken.survey.title}
          token={token}
        />
      </div>
    </div>
  );
}
