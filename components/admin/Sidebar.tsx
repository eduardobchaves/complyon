"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  AlertTriangle,
  Shield,
  Settings,
  LogOut,
  Brain,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  companyName: string;
  plan: string;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/surveys", icon: ClipboardList, label: "Pesquisas" },
  { href: "/employees", icon: Users, label: "Colaboradores" },
  { href: "/complaints", icon: AlertTriangle, label: "Canal de Denúncias" },
  { href: "/compliance", icon: Shield, label: "Conformidade NR-01" },
  { href: "/billing", icon: CreditCard, label: "Cobrança" },
  { href: "/settings", icon: Settings, label: "Configurações" },
];

const planColors: Record<string, string> = {
  FREE: "secondary",
  ACTIVE: "success",
  SUSPENDED: "destructive",
};

const planLabels: Record<string, string> = {
  FREE: "Gratuito",
  ACTIVE: "Ativo",
  SUSPENDED: "Suspenso",
};

export function Sidebar({ companyName, plan }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-[#1e2438] border-r border-green-600/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-green-600/10">
        <Link href="/dashboard" className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-lg bg-[#16a34a] flex items-center justify-center flex-shrink-0">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white tracking-wider font-[var(--font-sora)]">COMPLYON</p>
            <p className="text-xs text-green-400">Conformidade NR-01</p>
          </div>
        </Link>

        <div className="bg-[#252d45] rounded-lg p-3">
          <p className="text-xs text-[#9CA3AF] mb-1">Empresa</p>
          <p className="text-sm font-semibold text-[#dcfce7] truncate">{companyName}</p>
          <div className="mt-2">
            <Badge variant={planColors[plan] as "secondary" | "default" | "success" | "info" || "secondary"} className="text-xs">
              {planLabels[plan] || plan}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-[#16a34a] text-white"
                  : "text-[#9CA3AF] hover:bg-green-600/10 hover:text-[#dcfce7]"
              )}
            >
              <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-white" : "text-[#6B7280] group-hover:text-green-400")} />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-green-600/10">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#9CA3AF] hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 w-full"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
