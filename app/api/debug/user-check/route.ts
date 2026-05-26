import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check if superadmin exists
    const user = await prisma.user.findFirst({
      where: { email: "superadmin@complyon.com.br" },
      select: { id: true, email: true, name: true, role: true, active: true, password: !!true },
    });

    // Count all users
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      superadminFound: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        hasPassword: user.password
      } : null,
      totalUsers,
      database: "connected ✅"
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        database: "error"
      },
      { status: 500 }
    );
  }
}
