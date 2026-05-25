require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "superadmin@complyon.com.br";

  console.log(`🔍 Procurando todos os usuários com email: ${email}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const users = await prisma.user.findMany({
    where: { email },
    include: { company: true },
  });

  if (users.length === 0) {
    console.log("❌ Nenhum usuário encontrado!");
    return;
  }

  console.log(`✅ Encontrados ${users.length} usuário(s):\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.active}`);
    console.log(`   Company: ${user.company?.name || "null (SUPER_ADMIN)"}`);
    console.log(`   CompanyId: ${user.companyId || "null"}`);
    console.log(`   Password: ${user.password ? "✅ Sim" : "❌ Não"}`);
    console.log("");
  });

  if (users.length > 1) {
    console.log("⚠️  PROBLEMA ENCONTRADO: Há múltiplos usuários com esse email!");
    console.log("Isso causa conflito na autenticação!");
    console.log("\n🔧 Sugestão: Alterar email de um deles.");
  }
}

main()
  .catch((e) => {
    console.error("Erro:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
