import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("[DEBUG] Testing auth for:", email);

    // Find user
    const user = await prisma.user.findFirst({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", email },
        { status: 404 }
      );
    }

    console.log("[DEBUG] User found:", {
      id: user.id,
      email: user.email,
      active: user.active,
      hasPassword: !!user.password,
      role: user.role,
    });

    if (!user.password) {
      return NextResponse.json(
        { error: "User has no password", email },
        { status: 400 }
      );
    }

    if (!user.active) {
      return NextResponse.json(
        { error: "User is not active", email },
        { status: 403 }
      );
    }

    // Test password
    const valid = await bcrypt.compare(password, user.password);

    console.log("[DEBUG] Password valid:", valid);

    return NextResponse.json({
      success: true,
      message: "Authentication test passed",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        active: user.active,
      },
      passwordValid: valid,
    });
  } catch (error) {
    console.error("[DEBUG] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
