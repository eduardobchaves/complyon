import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(128, "Senha muito longa")
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

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    if (user.resetTokenExpiresAt && new Date() > user.resetTokenExpiresAt) {
      return NextResponse.json(
        { error: "Token expirado. Solicite um novo link de reset." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // where: { resetToken: token } makes this atomic — a second concurrent
    // request with the same token fails here once the first clears the field.
    await prisma.user.update({
      where: { resetToken: token },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ResetPassword] Error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Erro ao resetar senha" }, { status: 500 });
  }
}
