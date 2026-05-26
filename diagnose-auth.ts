import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

async function diagnose() {
  try {
    console.log("🔍 Checking superadmin user in database...\n");

    const user = await prisma.user.findFirst({
      where: { email: "superadmin@complyon.com.br" },
      include: { company: true },
    });

    if (!user) {
      console.log("❌ Superadmin user NOT found in database");
      console.log("\nAll users in database:");
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, role: true, companyId: true },
      });
      console.table(allUsers);
      process.exit(1);
    }

    console.log("✅ Superadmin user found!");
    console.log("📧 Email:", user.email);
    console.log(
      "🔐 Password hash:",
      user.password ? user.password.substring(0, 20) + "..." : "NO PASSWORD SET"
    );
    console.log("👤 Name:", user.name);
    console.log("👥 Role:", user.role);
    console.log("🏢 Company ID:", user.companyId);
    console.log("✔️ Active:", user.active);

    if (user.company) {
      console.log("🏭 Company Name:", user.company.name);
      console.log("🌐 Company Slug:", user.company.slug);
    }

    // Test password verification
    console.log("\n🔐 Testing password hash verification...");
    if (!user.password) {
      console.log("❌ NO PASSWORD HASH found - user cannot login!");
      process.exit(1);
    } else {
      const testPassword = "ComplyOn@2024";
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`Testing password: "${testPassword}"`);
      console.log(`Result: ${isValid ? "✅ VALID" : "❌ INVALID"}`);

      // Show password hash details
      console.log("\nPassword hash details:");
      console.log("Hash algorithm:", user.password.substring(0, 4)); // Should be $2a$, $2b$, or $2y$
      console.log("Cost factor:", user.password.substring(4, 6)); // Should be cost rounds
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
