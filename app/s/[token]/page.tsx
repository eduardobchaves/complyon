"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, SPHERES, LIKERT_SCALE } from "@/lib/questions";
import { LikertScale } from "@/components/survey/LikertScale";
import { QuestionCard } from "@/components/survey/QuestionCard";
import { ProgressBar } from "@/components/survey/ProgressBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Shield, Loader2, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

const LIKERT_QUESTIONS = QUESTIONS.filter(q => q.type === "likert");
const STEP_SIZE = 5;
const TOTAL_STEPS = Math.ceil(LIKERT_QUESTIONS.length / STEP_SIZE) + 1;

type TokenStatus = "loading" | "valid" | "used" | "invalid" | "closed";

interface SurveyInfo {
  id: string;
  title: string;
  status: string;
}

export default function TokenSurveyPage() {
  const router = useRouter();

  // Store token in state from URL — more reliable than useParams() in this Next.js version
  const [token, setToken] = useState<string>("");

  const [status, setStatus] = useState<TokenStatus>("loading");
  const [survey, setSurvey] = useState<SurveyInfo | null>(null);
  const [consented, setConsented] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [openText1, setOpenText1] = useState("");
  const [openText2, setOpenText2] = useState("");
  const [openText3, setOpenText3] = useState("");
  const [stressLevel, setStressLevel] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Extract token from /s/[token] URL path directly
    const segments = window.location.pathname.split("/").filter(Boolean);
    const t = segments[segments.indexOf("s") + 1] || "";
    setToken(t);

    if (!t) { setStatus("invalid"); return; }

    fetch(`/api/s/${t}`)
      .then(r => r.json())
      .then(data => {
        if (data.error === "used") return setStatus("used");
        if (data.error === "closed") return setStatus("closed");
        if (data.error) return setStatus("invalid");
        setSurvey(data.survey);
        setStatus("valid");
      })
      .catch(() => setStatus("invalid"));
  }, []);

  const handleSubmit = async () => {
    if (!token) {
      setError("Erro: token não encontrado. Tente acessar o link novamente.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          surveyId: survey!.id,
          answers: Object.fromEntries(Object.entries(answers).map(([k, v]) => [String(k), v])),
          openText1: openText1 || undefined,
          openText2: openText2 || undefined,
          openText3: openText3 || undefined,
          stressLevel,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = typeof data.error === "string" ? data.error : JSON.stringify(data.error) || "Erro ao enviar";
        throw new Error(msg);
      }
      router.push("/survey/complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar");
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
      </div>
    );
  }

  if (status === "used") {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-[#dcfce7] mb-2 font-[var(--font-sora)]">Pesquisa já respondida</h2>
          <p className="text-[#9CA3AF] text-sm">Este link já foi utilizado. Cada link é válido para uma resposta apenas.</p>
        </div>
      </div>
    );
  }

  if (status === "closed") {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-[#dcfce7] mb-2 font-[var(--font-sora)]">Pesquisa encerrada</h2>
          <p className="text-[#9CA3AF] text-sm">Esta pesquisa não está mais disponível para respostas.</p>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-[#dcfce7] mb-2 font-[var(--font-sora)]">Link inválido</h2>
          <p className="text-[#9CA3AF] text-sm">Este link não existe ou expirou.</p>
        </div>
      </div>
    );
  }

  const currentStepQuestions = LIKERT_QUESTIONS.slice(step * STEP_SIZE, (step + 1) * STEP_SIZE);
  const isOpenStep = step === TOTAL_STEPS - 1;
  const currentStepAnswered = currentStepQuestions.every(q => answers[q.id] !== undefined);

  const Header = () => (
    <header className="border-b border-green-600/20 bg-[#1e2438]">
      <div className="mx-auto max-w-3xl flex items-center gap-3 px-4 py-4">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-[#dcfce7] font-[var(--font-sora)]">ComplyOn</span>
        </a>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
          <Shield className="h-3 w-3" />
          100% anônimo
        </div>
      </div>
    </header>
  );

  // LGPD consent screen — shown once before the first question
  if (!consented) {
    return (
      <div className="min-h-screen bg-[#1a1a2e]">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-10 space-y-6">
          <div className="rounded-2xl border border-green-600/20 bg-[#1e2438] p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600/20">
                <Shield className="h-5 w-5 text-green-400" />
              </div>
              <h1 className="text-xl font-bold text-[#dcfce7] font-[var(--font-sora)]">
                Antes de começar
              </h1>
            </div>

            <p className="text-[#9CA3AF] text-sm leading-relaxed">
              Esta pesquisa coleta informações sobre seu bem-estar e saúde mental no trabalho. Por envolver dados de saúde, a{" "}
              <strong className="text-[#dcfce7]">Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)</strong> exige que você
              seja informado antes de participar.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-lg shrink-0">🔒</span>
                <div>
                  <p className="text-sm font-medium text-[#dcfce7]">Anonimato total</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Suas respostas são completamente desvinculadas da sua identidade. Nenhum dado que possa identificar você é
                    armazenado. Nem o administrador da empresa consegue saber o que você respondeu individualmente.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-lg shrink-0">📋</span>
                <div>
                  <p className="text-sm font-medium text-[#dcfce7]">O que coletamos</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Apenas suas respostas às perguntas desta pesquisa (escala de concordância e textos opcionais). Nenhuma outra
                    informação pessoal é coletada.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-lg shrink-0">⚖️</span>
                <div>
                  <p className="text-sm font-medium text-[#dcfce7]">Base legal</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    O processamento ocorre com base na obrigação legal da NR-01 (Portaria MTE nº 765/2025) e no seu
                    consentimento explícito abaixo (LGPD Art. 11, II, a).
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-lg shrink-0">📅</span>
                <div>
                  <p className="text-sm font-medium text-[#dcfce7]">Retenção de dados</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    As respostas são mantidas pelo prazo legal necessário à conformidade trabalhista (até 5 anos) e depois
                    apagadas definitivamente.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-lg shrink-0">✋</span>
                <div>
                  <p className="text-sm font-medium text-[#dcfce7]">Participação voluntária</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Sua participação é voluntária. Você pode optar por não responder sem qualquer consequência.
                    Para exercer seus direitos previstos no Art. 18 da LGPD (acesso, correção, exclusão), entre em contato com
                    o encarregado de dados da sua empresa.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" className="sm:w-auto w-full" onClick={() => window.history.back()}>
                Não participar
              </Button>
              <Button className="sm:flex-1" onClick={() => setConsented(true)}>
                Li e aceito participar desta pesquisa
              </Button>
            </div>

            <p className="text-center text-xs text-[#6B7280]">
              Política de Privacidade:{" "}
              <a href="/privacidade" className="underline hover:text-green-400" target="_blank" rel="noreferrer">
                complyon.com.br/privacidade
              </a>
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#dcfce7] font-[var(--font-sora)]">{survey?.title}</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Suas respostas são 100% anônimas e não vinculadas à sua identidade.</p>
        </div>

        <ProgressBar
          current={isOpenStep ? LIKERT_QUESTIONS.length : Math.min((step + 1) * STEP_SIZE, LIKERT_QUESTIONS.length)}
          total={LIKERT_QUESTIONS.length + 4}
          label={isOpenStep ? "Perguntas finais" : `Questões ${step * STEP_SIZE + 1}–${Math.min((step + 1) * STEP_SIZE, LIKERT_QUESTIONS.length)} de ${LIKERT_QUESTIONS.length}`}
        />

        {!isOpenStep ? (
          <div className="space-y-4">
            {currentStepQuestions.map((q, i) => {
              const sphere = SPHERES.find(s => s.id === q.sphereId);
              return (
                <QuestionCard key={q.id} number={step * STEP_SIZE + i + 1} text={q.text}>
                  <LikertScale
                    questionId={q.id}
                    value={answers[q.id] ?? null}
                    onChange={v => setAnswers(a => ({ ...a, [q.id]: v }))}
                  />
                  {sphere && <p className="mt-2 text-xs text-[#6B7280]">{sphere.icon} {sphere.name}</p>}
                </QuestionCard>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <QuestionCard number={LIKERT_QUESTIONS.length + 1} text="O que mais contribui positivamente para seu bem-estar no trabalho?">
              <Textarea value={openText1} onChange={e => setOpenText1(e.target.value)} placeholder="Compartilhe o que torna seu ambiente de trabalho melhor..." rows={3} />
            </QuestionCard>
            <QuestionCard number={LIKERT_QUESTIONS.length + 2} text="O que mais prejudica seu bem-estar no trabalho?">
              <Textarea value={openText2} onChange={e => setOpenText2(e.target.value)} placeholder="Quais aspectos poderiam ser melhorados..." rows={3} />
            </QuestionCard>
            <QuestionCard number={LIKERT_QUESTIONS.length + 3} text="Como você avalia seu nível de estresse atualmente? (1 = muito baixo, 10 = muito alto)">
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#9CA3AF]">1</span>
                <input type="range" min={1} max={10} value={stressLevel} onChange={e => setStressLevel(Number(e.target.value))} className="flex-1 accent-green-600" />
                <span className="text-sm text-[#9CA3AF]">10</span>
                <span className="w-8 text-center text-lg font-bold text-green-300 font-mono">{stressLevel}</span>
              </div>
            </QuestionCard>
            <QuestionCard number={LIKERT_QUESTIONS.length + 4} text="Há algo mais que gostaria de compartilhar com a empresa?">
              <Textarea value={openText3} onChange={e => setOpenText3(e.target.value)} placeholder="Sugestões, comentários adicionais..." rows={3} />
            </QuestionCard>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          {isOpenStep ? (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? "Enviando..." : "Enviar Respostas"}
            </Button>
          ) : (
            <Button onClick={() => setStep(s => s + 1)} disabled={!currentStepAnswered}>
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-[#6B7280]">
          🔒 Nenhum dado que possa identificar você é armazenado. Anonimato garantido.
        </p>
      </main>
    </div>
  );
}
