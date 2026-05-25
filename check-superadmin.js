require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const superadmin = await prisma.user.findFirst({
    where: {
      email: "superadmin@complyon.com.br",
      companyId: null,
    },
  });

  if (!superadmin) {
    console.error("❌ SUPER_ADMIN não encontrado no banco!");
    return;
  }

  console.log("✅ SUPER_ADMIN encontrado!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("ID:", superadmin.id);
  console.log("Email:", superadmin.email);
  console.log("Nome:", superadmin.name);
  console.log("Role:", superadmin.role);
  console.log("Active:", superadmin.active);
  console.log("CompanyId:", superadmin.companyId);
  console.log("Has Password:", superadmin.password ? "✅ Sim" : "❌ Não");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (!superadmin.active) {
    console.log("⚠️  SUPER_ADMIN está INATIVO! Ativando...");
    await prisma.user.update({
      where: { id: superadmin.id },
      data: { active: true },
    });
    console.log("✅ Ativado com sucesso!");
  }

  if (!superadmin.password) {
    console.log("⚠️  SUPER_ADMIN não tem senha! Use /forgot-password para resetar.");
  }

  console.log("\n💡 Credenciais:");
  console.log("Email: superadmin@complyon.com.br");
  console.log("Senha: ComplyOn@2024");
  console.log("\nTente fazer login agora!");
}

main()
  .catch((e) => {
    console.error("Erro:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
