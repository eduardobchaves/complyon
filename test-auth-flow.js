require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");
const z = require("zod");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  companySlug: z.string().optional(),
});

async function authorize(credentials) {
  console.log("🔐 Iniciando processo de autenticação...\n");

  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) {
    console.log("❌ Validação de schema falhou:");
    console.log(parsed.error.errors);
    return null;
  }

  const { email, password, companySlug } = parsed.data;
  console.log("✅ Schema validado");
  console.log("   Email:", email);
  console.log("   CompanySlug:", companySlug || "não fornecido");
  console.log("");

  let user;
  if (companySlug) {
    console.log("📍 Buscando usuário com empresa específica...");
    user = await prisma.user.findFirst({
      where: {
        email,
        company: { slug: companySlug },
      },
      include: { company: true },
    });
  } else {
    console.log("📍 Buscando usuário por email (sem empresa específica)...");
    const users = await prisma.user.findMany({
      where: { email },
      include: { company: true },
    });

    console.log(`   Encontrados ${users.length} usuário(s)`);

    if (users.length === 1) {
      user = users[0];
      console.log("   ✅ Único usuário encontrado");
    } else if (users.length > 1) {
      console.log("   ⚠️  Múltiplos usuários encontrados - requer seleção de empresa");
      return null;
    } else {
      console.log("   ❌ Nenhum usuário encontrado");
      return null;
    }
  }

  console.log("");

  if (!user) {
    console.log("❌ Usuário não encontrado após busca");
    return null;
  }

  console.log("✅ Usuário encontrado:");
  console.log("   ID:", user.id);
  console.log("   Email:", user.email);
  console.log("   Role:", user.role);
  console.log("   Active:", user.active);
  console.log("");

  if (!user.password) {
    console.log("❌ Usuário não tem senha definida");
    return null;
  }

  if (!user.active) {
    console.log("❌ Usuário está inativo");
    return null;
  }

  console.log("✅ Usuário ativo e com senha");
  console.log("");

  console.log("🔑 Validando senha...");
  const valid = await bcrypt.compare(password, user.password);
  console.log(valid ? "✅ Senha válida!" : "❌ Senha inválida!");

  if (!valid) {
    return null;
  }

  console.log("");
  console.log("✅✅✅ AUTENTICAÇÃO BEM-SUCEDIDA! ✅✅✅");
  console.log("");

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId ?? null,
    companySlug: user.company?.slug ?? null,
  };
}

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("TESTE DE AUTENTICAÇÃO");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const result = await authorize({
    email: "superadmin@complyon.com.br",
    password: "ComplyOn@2024",
  });

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  if (result) {
    console.log("✅ RESULTADO: Autenticação bem-sucedida!");
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("❌ RESULTADO: Autenticação falhou!");
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("Erro:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
