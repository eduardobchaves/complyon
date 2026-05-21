"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, SPHERES, LIKERT_SCALE } from "@/lib/questions";
import { LikertScale } from "@/components/survey/LikertScale";
import { QuestionCard } from "@/components/survey/QuestionCard";
import { ProgressBar } from "@/components/survey/ProgressBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const LIKERT_QUESTIONS = QUESTIONS.filter(q => q.type === "likert");
const STEP_SIZE = 5;
const TOTAL_STEPS = Math.ceil(LIKERT_QUESTIONS.length / STEP_SIZE) + 1; // +1 for open questions

interface Survey {
  id: string;
  title: string;
  status: string;
}

export default function SurveyPage() {
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [openText1, setOpenText1] = useState("");
  const [openText2, setOpenText2] = useState("");
  const [openText3, setOpenText3] = useState("");
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/surveys")
      .then(r => r.json())
      .then((surveys: Survey[]) => {
        const active = surveys.find(s => s.status === "ACTIVE");
        setSurvey(active || null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-green-400" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-20">
        <div className="mb-4 text-6xl">📋</div>
        <h2 className="text-2xl font-bold text-[#dcfce7] mb-3 font-[var(--font-sora)]">
          Nenhuma pesquisa aberta
        </h2>
        <p className="text-[#9CA3AF] max-w-md mx-auto">
          No momento não há pesquisa de clima ativa. Você será notificado quando uma nova pesquisa for aberta.
        </p>
      </div>
    );
  }

  const currentStepQuestions = LIKERT_QUESTIONS.slice(step * STEP_SIZE, (step + 1) * STEP_SIZE);
  const isLastLikertStep = step === TOTAL_STEPS - 2;
  const isOpenStep = step === TOTAL_STEPS - 1;
  const totalAnswered = Object.keys(answers).length;
  const currentStepAnswered = currentStepQuestions.every(q => answers[q.id] !== undefined);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyId: survey.id,
          answers,
          openText1: openText1 || undefined,
          openText2: openText2 || undefined,
          openText3: openText3 || undefined,
          stressLevel,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar");
      }
      router.push("/survey/complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar resposta");
      setSubmitting(false);
    }
  };

  const getSphereForQuestion = (sphereId: string | null) => {
    return SPHERES.find(s => s.id === sphereId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#dcfce7] font-[var(--font-sora)]">{survey.title}</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">Suas respostas são 100% anônimas</p>
      </div>

      <ProgressBar
        current={isOpenStep ? LIKERT_QUESTIONS.length : Math.min((step + 1) * STEP_SIZE, LIKERT_QUESTIONS.length)}
        total={LIKERT_QUESTIONS.length + 4}
        label={isOpenStep ? "Perguntas finais" : `Questões ${step * STEP_SIZE + 1}–${Math.min((step + 1) * STEP_SIZE, LIKERT_QUESTIONS.length)} de ${LIKERT_QUESTIONS.length}`}
      />

      {!isOpenStep ? (
        <div className="space-y-4">
          {currentStepQuestions.map((q, i) => {
            const sphere = getSphereForQuestion(q.sphereId);
            return (
              <QuestionCard
                key={q.id}
                number={step * STEP_SIZE + i + 1}
                text={q.text}
              >
                <LikertScale
                  questionId={q.id}
                  value={answers[q.id] ?? null}
                  onChange={v => setAnswers(a => ({ ...a, [q.id]: v }))}
                />
                {sphere && (
                  <p className="mt-2 text-xs text-[#6B7280]">{sphere.icon} {sphere.name}</p>
                )}
              </QuestionCard>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <QuestionCard number={LIKERT_QUESTIONS.length + 1} text="O que mais contribui positivamente para seu bem-estar no trabalho?">
            <Textarea
              value={openText1}
              onChange={e => setOpenText1(e.target.value)}
              placeholder="Compartilhe o que torna seu ambiente de trabalho melhor..."
              rows={3}
            />
          </QuestionCard>

          <QuestionCard number={LIKERT_QUESTIONS.length + 2} text="O que mais prejudica seu bem-estar no trabalho?">
            <Textarea
              value={openText2}
              onChange={e => setOpenText2(e.target.value)}
              placeholder="Quais aspectos poderiam ser melhorados..."
              rows={3}
            />
          </QuestionCard>

          <QuestionCard number={LIKERT_QUESTIONS.length + 3} text="Como você avalia seu nível de estresse atualmente? (1 = muito baixo, 10 = muito alto)">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#9CA3AF]">1</span>
              <input
                type="range"
                min={1}
                max={10}
                value={stressLevel}
                onChange={e => setStressLevel(Number(e.target.value))}
                className="flex-1 accent-green-600"
              />
              <span className="text-sm text-[#9CA3AF]">10</span>
              <span className="w-8 text-center text-lg font-bold text-green-300 font-mono">{stressLevel}</span>
            </div>
          </QuestionCard>

          <QuestionCard number={LIKERT_QUESTIONS.length + 4} text="Há algo mais que gostaria de compartilhar com a empresa?">
            <Textarea
              value={openText3}
              onChange={e => setOpenText3(e.target.value)}
              placeholder="Sugestões, comentários adicionais..."
              rows={3}
            />
          </QuestionCard>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        {isOpenStep ? (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Enviando..." : "Enviar Respostas"}
          </Button>
        ) : (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!currentStepAnswered}
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-[#6B7280]">
        🔒 Suas respostas são completamente anônimas. Nenhum dado identificador é armazenado.
      </p>
    </div>
  );
}
