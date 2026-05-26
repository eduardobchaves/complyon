import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  console.log("[test-login] Attempting login for:", email);

  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    console.log("[test-login] User not found");
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  if (!user.password) {
    console.log("[test-login] User has no password");
    return NextResponse.json({ error: "No password set" }, { status: 401 });
  }

  if (!user.active) {
    console.log("[test-login] User not active");
    return NextResponse.json({ error: "User not active" }, { status: 401 });
  }

  const passwordValid = await bcrypt.compare(password, user.password);

  if (!passwordValid) {
    console.log("[test-login] Password invalid");
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  console.log("[test-login] Login successful!");

  return NextResponse.json({
    success: true,
    message: "Login test passed!",
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
}
