require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("ComplyOn@2024", 12);

  // Para SUPER_ADMIN, usar findFirst pois companyId é null
  let superadmin = await prisma.user.findFirst({
    where: {
      email: "superadmin@complyon.com.br",
      companyId: null,
    },
  });

  if (superadmin) {
    // Se já existe, apenas garante que está ativo
    superadmin = await prisma.user.update({
      where: { id: superadmin.id },
      data: {
        active: true,
        password: hash,
      },
    });
    console.log("Superadmin atualizado:", superadmin.email);
  } else {
    // Se não existe, cria novo
    superadmin = await prisma.user.create({
      data: {
        email: "superadmin@complyon.com.br",
        name: "Super Admin",
        password: hash,
        role: "SUPER_ADMIN",
        active: true,
        companyId: null,
      },
    });
    console.log("Superadmin criado:", superadmin.email);
  }

  console.log("Senha: ComplyOn@2024");
  console.log("IMPORTANTE: Troque a senha apos o primeiro login.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());