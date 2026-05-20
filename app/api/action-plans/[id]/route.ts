import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const companyId = (session.user as { companyId: string }).companyId;

  const plan = await prisma.actionPlan.findFirst({ where: { id, companyId } });
  if (!plan) {
    return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const { status, responsible, deadline, notes, title, description } = body;

  const updated = await prisma.actionPlan.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(responsible !== undefined && { responsible }),
      ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      ...(notes !== undefined && { notes }),
      ...(title && { title }),
      ...(description && { description }),
      ...(status === "COMPLETED" && !plan.completedAt && { completedAt: new Date() }),
    },
  });

  return NextResponse.json(updated);
}
