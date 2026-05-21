require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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