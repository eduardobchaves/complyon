import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Building2, LogOut } from "lucide-react";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0F0A1A]">
      <header className="border-b border-purple-500/10 bg-[#1A1030] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#E9D5FF] font-[var(--font-sora)]">ComplyOn</p>
            <p className="text-xs text-purple-400">Super Admin</p>
          </div>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit" className="flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-red-400 transition-colors">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
      </header>

      <main className="p-8">{children}</main>
    </div>
  );
}
