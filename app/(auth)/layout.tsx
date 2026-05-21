import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ComplyOn — Acesso",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#16a34a] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" fill="white"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-[#dcfce7] font-[var(--font-sora)]">ComplyOn</span>
          </div>
          <p className="text-sm text-[#9CA3AF]">Plataforma de Saúde Mental Corporativa</p>
        </div>
        {children}
      </div>
    </div>
  );
}
