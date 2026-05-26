import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResetPasswordEmail } from "@/lib/resend";
import crypto from "crypto";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const { email } = parsed.data;

    // Buscar usuário admin por email
    const user = await prisma.user.findFirst({
      where: {
        email,
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
        active: true,
      },
      include: { company: true },
    });

    // Sempre retornar sucesso mesmo se email não encontrado (segurança)
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Gerar token de reset com expiração de 1 hora
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiresAt: resetTokenExpiry,
      },
    });

    // Enviar email com link de reset
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    await sendResetPasswordEmail({
      to: user.email,
      name: user.name || user.email,
      companyName: user.company?.name || "ComplyOn",
      resetLink,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ForgotPassword] Error:", error);
    return NextResponse.json({ success: true }); // Sempre retornar sucesso
  }
}
