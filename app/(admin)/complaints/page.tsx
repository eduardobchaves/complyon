import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ComplaintRow } from "@/components/admin/ComplaintRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

const statusCounts = (complaints: Array<{ status: string }>) => ({
  open: complaints.filter((c) => c.status === "OPEN").length,
  under_review: complaints.filter((c) => c.status === "UNDER_REVIEW").length,
  completed: complaints.filter((c) => c.status === "COMPLETED").length,
});

export default async function ComplaintsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const companyId = (session.user as { companyId: string }).companyId;

  const complaints = await prisma.complaint.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });

  const counts = statusCounts(complaints);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#dcfce7] font-[var(--font-sora)]">
          Canal de Denúncias
        </h1>
        <p className="text-[#9CA3AF] mt-1">
          Gerencie as denúncias recebidas de forma anônima
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <span className="text-amber-400 font-bold">{counts.open}</span>
          <span className="text-sm text-[#9CA3AF]">Abertas</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
          <span className="text-cyan-400 font-bold">{counts.under_review}</span>
          <span className="text-sm text-[#9CA3AF]">Em análise</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <span className="text-emerald-400 font-bold">{counts.completed}</span>
          <span className="text-sm text-[#9CA3AF]">Concluídas</span>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {complaints.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="Nenhuma denúncia recebida"
              description="As denúncias feitas pelos colaboradores aparecerão aqui de forma anônima."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((complaint: typeof complaints[number]) => (
                  <ComplaintRow
                    key={complaint.id}
                    complaint={{
                      ...complaint,
                      createdAt: complaint.createdAt.toISOString(),
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
