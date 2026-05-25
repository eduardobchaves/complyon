require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

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
    console.error("❌ SUPER_ADMIN não encontrado!");
    return;
  }

  console.log("📋 Dados do SUPER_ADMIN:");
  console.log("Email:", superadmin.email);
  console.log("Password Hash:", superadmin.password?.substring(0, 20) + "...");
  console.log("");

  const testPassword = "ComplyOn@2024";
  console.log("🔐 Testando senha: " + testPassword);

  try {
    const isValid = await bcrypt.compare(testPassword, superadmin.password);
    console.log("Resultado:", isValid ? "✅ VÁLIDA" : "❌ INVÁLIDA");

    if (!isValid) {
      console.log("\n⚠️  A senha armazenada não corresponde!");
      console.log("Gerando novo hash e atualizando...");

      const newHash = await bcrypt.hash(testPassword, 12);
      await prisma.user.update({
        where: { id: superadmin.id },
        data: { password: newHash },
      });

      console.log("✅ Senha atualizada com sucesso!");
      console.log("\nTente fazer login novamente com:");
      console.log("Email: superadmin@complyon.com.br");
      console.log("Senha: ComplyOn@2024");
    }
  } catch (e) {
    console.error("❌ Erro ao comparar senhas:", e.message);
  }
}

main()
  .catch((e) => {
    console.error("Erro:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
