import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role: string }).role;
  if (role === "SUPER_ADMIN") {
    redirect("/superadmin/companies");
  }

  const companyId = (session.user as { companyId: string }).companyId;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true, plan: true },
  });

  if (!company) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#0F0A1A]">
      <Sidebar companyName={company.name} plan={company.plan} />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
