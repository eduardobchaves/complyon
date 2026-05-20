import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Brain } from "lucide-react";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#0F0A1A]">
      <header className="border-b border-purple-500/20 bg-[#1A1030]">
        <div className="mx-auto max-w-3xl flex items-center gap-3 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-[#E9D5FF] font-[var(--font-sora)]">SafeMind NR-1</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
