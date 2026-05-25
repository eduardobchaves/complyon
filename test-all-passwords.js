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

  const passwordsToTest = [
    "ComplyOn@2024",
    "complyon@2024",
    "COMPLYON@2024",
    "ComplyOn@2024 ",
    " ComplyOn@2024",
    "ComplyOn@2024\n",
    "ComplyOn@2024\r",
    "ComplyOn@2024\t",
  ];

  console.log("🧪 Testando variações de senha...\n");

  for (const pwd of passwordsToTest) {
    try {
      const isValid = await bcrypt.compare(pwd, superadmin.password);
      const displayPwd = pwd
        .replace(/ /g, "·")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");
      console.log(`${isValid ? "✅" : "❌"} "${displayPwd}"`);
    } catch (e) {
      console.log(`❌ "${pwd}" - ERRO: ${e.message}`);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💡 Instruções de login:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Email: superadmin@complyon.com.br");
  console.log("Senha: ComplyOn@2024");
  console.log("\n⚠️  Certifique-se de:");
  console.log("  - Sem espaços antes ou depois");
  console.log("  - Caps Lock desativado");
  console.log("  - Teclado em português (@ sem shift)");
  console.log("  - Verificar se está copiando/colando corretamente");

  console.log("\n❓ Se ainda tiver problema, execute este comando:");
  console.log("  Para resetar via 'Esqueceu a senha?'");
}

main()
  .catch((e) => {
    console.error("Erro:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
