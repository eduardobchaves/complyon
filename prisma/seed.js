require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedPassword) {
    throw new Error("SEED_ADMIN_PASSWORD environment variable is required");
  }
  if (
    seedPassword.length < 8 ||
    !/[A-Z]/.test(seedPassword) ||
    !/[a-z]/.test(seedPassword) ||
    !/\d/.test(seedPassword)
  ) {
    throw new Error(
      "SEED_ADMIN_PASSWORD must be at least 8 characters and contain uppercase, lowercase, and a digit"
    );
  }

  const hash = await bcrypt.hash(seedPassword, 12);

  let superadmin = await prisma.user.findFirst({
    where: {
      email: "superadmin@complyon.com.br",
      companyId: null,
    },
  });

  if (superadmin) {
    superadmin = await prisma.user.update({
      where: { id: superadmin.id },
      data: { active: true, password: hash },
    });
    console.log("Superadmin atualizado:", superadmin.email);
  } else {
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

  console.log("Superadmin pronto. Troque a senha após o primeiro login.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
