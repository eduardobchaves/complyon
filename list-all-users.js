require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("📋 Listando todos os usuários no banco de dados:\n");

  const users = await prisma.user.findMany({
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Total: ${users.length} usuário(s)\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Ativo: ${user.active ? "✅ Sim" : "❌ Não"}`);
    console.log(`   Empresa: ${user.company?.name || "NENHUMA (SUPER_ADMIN)"}`);
    console.log(`   Senha: ${user.password ? "✅ Sim" : "❌ Não"}`);
    console.log("");
  });
}

main()
  .catch((e) => {
    console.error("Erro:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
