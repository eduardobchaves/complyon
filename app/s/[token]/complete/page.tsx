export default function TokenSurveyCompletePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-[#E9D5FF] font-[var(--font-sora)] mb-4">
          Obrigado!
        </h1>
        <p className="text-[#9CA3AF] mb-2">
          Suas respostas foram registradas com sucesso.
        </p>
        <p className="text-sm text-[#6B7280]">
          Lembre-se: suas respostas são completamente anônimas e contribuem para melhorar o ambiente de trabalho na sua empresa.
        </p>
      </div>
    </div>
  );
}
