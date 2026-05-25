import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos 1 letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos 1 letra minúscula")
    .regex(/\d/, "Senha deve conter pelo menos 1 número"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validação falhou" },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        inviteToken: token,
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
      },
    });

    if (!user) {
      console.error("[ResetPassword] User not found with token:", token);
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 400 }
      );
    }

    // Check if token is expired (invitedAt stores the expiration time)
    if (user.invitedAt && new Date() > user.invitedAt) {
      console.error("[ResetPassword] Token expired for user:", user.id);
      return NextResponse.json(
        { error: "Token expirado. Solicite um novo link de reset." },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user with new password and clear the reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        inviteToken: null,
        invitedAt: null,
      },
    });

    console.log("[ResetPassword] Password reset successfully for user:", user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[ResetPassword] Error:", errorMessage);
    return NextResponse.json(
      { error: "Erro ao resetar senha" },
      { status: 500 }
    );
  }
}
