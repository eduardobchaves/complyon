/**
 * Run this from C:\Users\eduar\Projects\Psicomply with: node apply-changes.js
 * It creates/updates all files for the superadmin company registration flow.
 */
const fs = require("fs");
const path = require("path");

function write(filePath, content) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log("wrote:", filePath);
}

// ── prisma/schema.prisma ──────────────────────────────────────────────────────
write("prisma/schema.prisma", `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum Role {
  SUPER_ADMIN
  ADMIN
  MANAGER
  EMPLOYEE
}

enum Plan {
  FREE
  STARTER
  GROWTH
  ENTERPRISE
}

enum SurveyStatus {
  DRAFT
  ACTIVE
  CLOSED
  ARCHIVED
}

enum RiskLevel {
  LOW
  MODERATE
  HIGH
}

enum ActionStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum ComplaintCategory {
  MORAL_HARASSMENT
  SEXUAL_HARASSMENT
  FRAUD_CORRUPTION
  NORM_VIOLATION
  INTERPERSONAL_CONFLICT
  DISCRIMINATION
  OTHER
}

enum ComplaintStatus {
  OPEN
  UNDER_REVIEW
  COMPLETED
}

model Company {
  id               String    @id @default(cuid())
  name             String
  cnpj             String    @unique
  slug             String    @unique
  plan             Plan      @default(FREE)
  logoUrl          String?
  stripeCustomerId String?
  stripeSubId      String?
  maxEmployees     Int       @default(10)
  firstCode        String?   @unique
  adminEmail       String?
  activated        Boolean   @default(false)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  users        User[]
  surveys      Survey[]
  complaints   Complaint[]
  actionPlans  ActionPlan[]
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  password      String?
  role          Role      @default(EMPLOYEE)
  active        Boolean   @default(true)
  inviteToken   String?   @unique
  invitedAt     DateTime?
  companyId     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  company     Company?     @relation(fields: [companyId], references: [id], onDelete: Cascade)
  sessions    Session[]
  accounts    Account[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Survey {
  id          String       @id @default(cuid())
  title       String
  description String?
  status      SurveyStatus @default(DRAFT)
  startDate   DateTime?
  endDate     DateTime?
  companyId   String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  company     Company      @relation(fields: [companyId], references: [id], onDelete: Cascade)
  responses   Response[]
  actionPlans ActionPlan[]
}

model Response {
  id        String   @id @default(cuid())
  surveyId  String
  answers   Json
  scores    Json?
  createdAt DateTime @default(now())

  survey Survey @relation(fields: [surveyId], references: [id], onDelete: Cascade)
}

model ActionPlan {
  id             String       @id @default(cuid())
  surveyId       String
  companyId      String
  sphereId       String
  title          String
  description    String       @db.Text
  riskLevel      RiskLevel
  status         ActionStatus @default(PENDING)
  responsible    String?
  deadline       DateTime?
  completedAt    DateTime?
  notes          String?      @db.Text
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  survey  Survey  @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
}

model Complaint {
  id          String            @id @default(cuid())
  protocol    String            @unique
  companyId   String
  category    ComplaintCategory
  description String            @db.Text
  status      ComplaintStatus   @default(OPEN)
  notes       String?           @db.Text
  reviewedAt  DateTime?
  completedAt DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
}
`);

// ── prisma/seed.js ────────────────────────────────────────────────────────────
write("prisma/seed.js", `const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("ComplyOn@2024", 12);
  const superadmin = await prisma.user.upsert({
    where: { email: "superadmin@complyon.com.br" },
    update: {},
    create: {
      email: "superadmin@complyon.com.br",
      name: "Super Admin",
      password: hash,
      role: "SUPER_ADMIN",
      active: true,
    },
  });
  console.log("Superadmin criado:", superadmin.email);
  console.log("Senha inicial: ComplyOn@2024");
  console.log("IMPORTANTE: Troque a senha apos o primeiro login.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
`);

// ── lib/auth.ts ───────────────────────────────────────────────────────────────
write("lib/auth.ts", `import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { company: true },
        });

        if (!user || !user.password || !user.active) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId ?? null,
          companySlug: user.company?.slug ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { role: string; companyId: string; companySlug: string };
        token.role = u.role;
        token.companyId = u.companyId;
        token.companySlug = u.companySlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        (session.user as { role: string }).role = token.role as string;
        (session.user as { companyId: string }).companyId = token.companyId as string;
        (session.user as { companySlug: string }).companySlug = token.companySlug as string;
      }
      return session;
    },
  },
});
`);

// ── app/(admin)/layout.tsx ────────────────────────────────────────────────────
write("app/(admin)/layout.tsx", `import { redirect } from "next/navigation";
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
`);

// ── app/(auth)/login/page.tsx ─────────────────────────────────────────────────
write("app/(auth)/login/page.tsx", `"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setError(null);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou senha inválidos. Verifique seus dados e tente novamente.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Ocorreu um erro. Tente novamente.");
    }
  };

  return (
    <Card className="border border-purple-500/20 bg-[#1A1030]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-[#E9D5FF] font-[var(--font-sora)]">
          Entrar na plataforma
        </CardTitle>
        <CardDescription className="text-[#9CA3AF]">
          Acesse seu painel de saúde mental organizacional
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="seu@email.com" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link href="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>

          <p className="text-center text-sm text-[#9CA3AF]">
            Primeira vez?{" "}
            <Link href="/ativar" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Registre aqui
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
`);

// ── app/(auth)/ativar/page.tsx ────────────────────────────────────────────────
write("app/(auth)/ativar/page.tsx", `"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z
  .object({
    email: z.string().email("Email inválido"),
    firstCode: z.string().min(1, "Código obrigatório"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function AtivarPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) setValue("firstCode", code);
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    const res = await fetch("/api/auth/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, firstCode: data.firstCode, password: data.password }),
    });

    const result = await res.json();
    if (!res.ok) {
      setError(result.error || "Erro ao ativar conta.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2500);
  };

  if (success) {
    return (
      <Card className="border border-emerald-500/20 bg-[#1A1030]">
        <CardContent className="pt-8 pb-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#E9D5FF] mb-2">Conta ativada com sucesso!</h3>
          <p className="text-[#9CA3AF]">Redirecionando para o login...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-purple-500/20 bg-[#1A1030]">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="h-5 w-5 text-purple-400" />
          <CardTitle className="text-2xl font-bold text-[#E9D5FF] font-[var(--font-sora)]">
            Ativar acesso
          </CardTitle>
        </div>
        <CardDescription className="text-[#9CA3AF]">
          Use o código recebido para criar sua conta.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Seu email</Label>
            <Input id="email" type="email" placeholder="voce@empresa.com.br" {...register("email")} />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstCode">Código de ativação</Label>
            <Input id="firstCode" placeholder="Código fornecido pela ComplyOn" className="font-mono tracking-widest" {...register("firstCode")} />
            {errors.firstCode && <p className="text-xs text-red-400">{errors.firstCode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Criar senha</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Mínimo 8 caracteres" className="pr-10" {...register("password")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input id="confirmPassword" type="password" placeholder="Repetir senha" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {isSubmitting ? "Ativando..." : "Ativar conta"}
          </Button>

          <p className="text-center text-sm text-[#9CA3AF]">
            Já tem conta?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
`);

// ── app/(superadmin)/layout.tsx ───────────────────────────────────────────────
write("app/(superadmin)/layout.tsx", `import { redirect } from "next/navigation";
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
`);

// ── app/(superadmin)/companies/page.tsx ───────────────────────────────────────
write("app/(superadmin)/companies/page.tsx", `import { prisma } from "@/lib/prisma";
import { CreateCompanyDialog } from "./CreateCompanyDialog";
import { CopyLinkButton } from "./CopyLinkButton";
import { Building2, CheckCircle2, Clock } from "lucide-react";

function formatCNPJ(cnpj: string) {
  return cnpj.replace(/^(\\d{2})(\\d{3})(\\d{3})(\\d{4})(\\d{2})$/, "$1.$2.$3/$4-$5");
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
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/5">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-purple-500/5 transition-colors">
                  <td className="px-5 py-4 font-medium text-[#E9D5FF]">{company.name}</td>
                  <td className="px-5 py-4 text-[#9CA3AF] font-mono text-xs">{formatCNPJ(company.cnpj)}</td>
                  <td className="px-5 py-4 text-[#9CA3AF]">{company.adminEmail ?? "—"}</td>
                  <td className="px-5 py-4">
                    {company.firstCode ? <CopyLinkButton code={company.firstCode} /> : <span className="text-[#4B5563]">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    {company.activated ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
                        <Clock className="h-3.5 w-3.5" /> Aguardando
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right text-[#9CA3AF]">{company._count.users} / {company.maxEmployees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`);

// ── app/(superadmin)/companies/CreateCompanyDialog.tsx ────────────────────────
write("app/(superadmin)/companies/CreateCompanyDialog.tsx", `"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  adminEmail: z.string().email("Email inválido"),
  firstCode: z.string().min(4, "Código deve ter no mínimo 4 caracteres").max(32),
  maxEmployees: z.coerce.number().int().min(1, "Mínimo 1 colaborador"),
});

type FormData = z.infer<typeof schema>;

function formatCNPJ(value: string) {
  const digits = value.replace(/\\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\\d{2})(\\d)/, "$1.$2")
    .replace(/^(\\d{2})\\.(\\d{3})(\\d)/, "$1.$2.$3")
    .replace(/\\.(\\d{3})(\\d)/, ".$1/$2")
    .replace(/(\\d{4})(\\d)/, "$1-$2");
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function CreateCompanyDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { maxEmployees: 20, firstCode: generateCode() },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const res = await fetch("/api/superadmin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, cnpj: data.cnpj.replace(/\\D/g, "") }),
    });
    const result = await res.json();
    if (!res.ok) { setError(result.error || "Erro ao criar empresa."); return; }
    reset({ maxEmployees: 20, firstCode: generateCode() });
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2"><Plus className="h-4 w-4" />Nova Empresa</Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1A1030] border border-purple-500/20 text-[#E9D5FF] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#E9D5FF] font-[var(--font-sora)]">Cadastrar nova empresa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>}
          <div className="space-y-2">
            <Label>Nome da empresa</Label>
            <Input placeholder="Empresa Ltda." {...register("name")} />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>CNPJ</Label>
            <Input placeholder="00.000.000/0001-00" {...register("cnpj")} onChange={(e) => setValue("cnpj", formatCNPJ(e.target.value))} />
            {errors.cnpj && <p className="text-xs text-red-400">{errors.cnpj.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email do administrador</Label>
            <Input type="email" placeholder="contato@empresa.com.br" {...register("adminEmail")} />
            {errors.adminEmail && <p className="text-xs text-red-400">{errors.adminEmail.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Código de ativação</Label>
            <div className="flex gap-2">
              <Input placeholder="Ex: ABC12345" {...register("firstCode")} className="font-mono" />
              <Button type="button" variant="outline" size="icon" onClick={() => setValue("firstCode", generateCode())} title="Gerar código">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {errors.firstCode && <p className="text-xs text-red-400">{errors.firstCode.message}</p>}
            <p className="text-xs text-[#6B7280]">O cliente usará este código para ativar o acesso.</p>
          </div>
          <div className="space-y-2">
            <Label>Máximo de colaboradores</Label>
            <Input type="number" min={1} {...register("maxEmployees")} />
            {errors.maxEmployees && <p className="text-xs text-red-400">{errors.maxEmployees.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
`);

// ── app/(superadmin)/companies/CopyLinkButton.tsx ─────────────────────────────
write("app/(superadmin)/companies/CopyLinkButton.tsx", `"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyLinkButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = \`\${window.location.origin}/ativar?code=\${code}\`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors font-mono" title="Copiar link de ativação">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copiado!" : code}
    </button>
  );
}
`);

// ── app/api/auth/register/route.ts ────────────────────────────────────────────
write("app/api/auth/register/route.ts", `import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Registro público desabilitado. Solicite acesso ao administrador." },
    { status: 410 }
  );
}
`);

// ── app/api/auth/activate/route.ts ────────────────────────────────────────────
write("app/api/auth/activate/route.ts", `import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const activateSchema = z.object({
  email: z.string().email(),
  firstCode: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = activateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { email, firstCode, password } = parsed.data;
  const company = await prisma.company.findUnique({ where: { firstCode } });

  if (!company) return NextResponse.json({ error: "Código de ativação inválido" }, { status: 400 });
  if (company.activated) return NextResponse.json({ error: "Esta empresa já foi ativada" }, { status: 409 });
  if (company.adminEmail && company.adminEmail.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Email não autorizado para este código" }, { status: 403 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.create({
      data: { email, name: email.split("@")[0], password: hashedPassword, role: "ADMIN", active: true, companyId: company.id },
    }),
    prisma.company.update({ where: { id: company.id }, data: { activated: true } }),
  ]);

  return NextResponse.json({ success: true }, { status: 201 });
}
`);

// ── app/api/superadmin/companies/route.ts ─────────────────────────────────────
write("app/api/superadmin/companies/route.ts", `import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function generateSlug(name: string): string {
  return name.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}

const createSchema = z.object({
  name: z.string().min(2),
  cnpj: z.string().length(14),
  adminEmail: z.string().email(),
  firstCode: z.string().min(4).max(32),
  maxEmployees: z.number().int().min(1).default(20),
});

async function requireSuperAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "SUPER_ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, cnpj: true, adminEmail: true, firstCode: true, activated: true, maxEmployees: true, plan: true, createdAt: true, _count: { select: { users: true } } },
  });
  return NextResponse.json(companies);
}

export async function POST(request: NextRequest) {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { name, cnpj, adminEmail, firstCode, maxEmployees } = parsed.data;

  const [existingCnpj, existingCode] = await Promise.all([
    prisma.company.findUnique({ where: { cnpj } }),
    prisma.company.findUnique({ where: { firstCode } }),
  ]);

  if (existingCnpj) return NextResponse.json({ error: "CNPJ já cadastrado" }, { status: 409 });
  if (existingCode) return NextResponse.json({ error: "Código já utilizado" }, { status: 409 });

  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let suffix = 0;
  while (await prisma.company.findUnique({ where: { slug } })) { suffix++; slug = \`\${baseSlug}-\${suffix}\`; }

  const company = await prisma.company.create({ data: { name, cnpj, slug, adminEmail, firstCode, maxEmployees, plan: "FREE" } });
  return NextResponse.json(company, { status: 201 });
}
`);

console.log("\nDone! Now run:");
console.log("  npx prisma migrate dev --name add-company-activation");
console.log("  npx prisma db seed");
