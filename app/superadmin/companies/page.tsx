import { prisma } from "@/lib/prisma";
import { CreateCompanyDialog } from "./CreateCompanyDialog";
import { CopyLinkButton } from "./CopyLinkButton";
import { EditCompanyDialog } from "./EditCompanyDialog";
import { DeleteCompanyButton } from "./DeleteCompanyButton";
import { Building2, CheckCircle2, Clock } from "lucide-react";

function formatCNPJ(cnpj: string) {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      cnpj: true,
      adminEmail: true,
      firstCode: true,
      activated: true,
      maxEmployees: true,
      createdAt: true,
      _count: { select: { users: true } },
    },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#E9D5FF] font-[var(--font-sora)]">Empresas</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">{companies.length} empresa{companies.length !== 1 ? "s" : ""} cadastrada{companies.length !== 1 ? "s" : ""}</p>
        </div>
        <CreateCompanyDialog />
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-16 border border-purple-500/10 rounded-xl bg-[#1A1030]">
          <Building2 className="h-10 w-10 text-[#4B5563] mx-auto mb-3" />
          <p className="text-[#9CA3AF]">Nenhuma empresa cadastrada ainda.</p>
          <p className="text-sm text-[#6B7280] mt-1">Clique em "Nova Empresa" para começar.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-purple-500/10 bg-[#1A1030] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-500/10">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Empresa</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">CNPJ</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Email admin</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Código / Link</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Colaboradores</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/5">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-purple-500/5 transition-colors">
                  <td className="px-5 py-4 font-medium text-[#E9D5FF]">{company.name}</td>
                  <td className="px-5 py-4 text-[#9CA3AF] font-mono text-xs">{formatCNPJ(company.cnpj)}</td>
                  <td className="px-5 py-4 text-[#9CA3AF]">{company.adminEmail ?? "—"}</td>
                  <td className="px-5 py-4">
                    {company.firstCode ? (
                      <CopyLinkButton code={company.firstCode} />
                    ) : (
                      <span className="text-[#4B5563]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {company.activated ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
                        <Clock className="h-3.5 w-3.5" />
                        Aguardando
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right text-[#9CA3AF]">
                    {company._count.users} / {company.maxEmployees}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <EditCompanyDialog company={company} />
                      <DeleteCompanyButton id={company.id} name={company.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
