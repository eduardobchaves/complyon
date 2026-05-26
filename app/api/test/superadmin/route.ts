import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "superadmin@complyon.com.br" },
    });

    if (!user) {
      return NextResponse.json({
        found: false,
        message: "Superadmin user NOT found in database",
        email: "superadmin@complyon.com.br"
      });
    }

    const passwordValid = user.password ? await bcrypt.compare("ComplyOn@2024", user.password) : false;

    return NextResponse.json({
      found: true,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
      hasPassword: !!user.password,
      passwordValid,
      message: passwordValid ? "✅ Superadmin exists and password is correct!" : "❌ Password mismatch"
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        found: false
      },
      { status: 500 }
    );
  }
}
