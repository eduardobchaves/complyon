import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Brain } from "lucide-react";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <header className="border-b border-green-600/20 bg-[#1e2438]">
        <div className="mx-auto max-w-3xl flex items-center gap-3 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-[#dcfce7] font-[var(--font-sora)]">ComplyOn</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
