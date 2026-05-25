import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const saveComplianceSchema = z.object({
  itemId: z.string().min(1),
  status: z.enum(["ok", "pending", "attention"]),
  comment: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyId = (session.user as { companyId: string }).companyId;
  const body = await request.json();

  const parsed = saveComplianceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { itemId, status, comment } = parsed.data;

  try {
    console.log("[Compliance] Saving override:", { companyId, itemId, status, comment });

    // Tenta encontrar o override existente
    const existing = await prisma.complianceOverride.findFirst({
      where: { companyId, itemId },
    });

    console.log("[Compliance] Existing override:", existing);

    let override;
    if (existing) {
      // Atualiza se já existe
      console.log("[Compliance] Updating existing override");
      override = await prisma.complianceOverride.update({
        where: { id: existing.id },
        data: { status, comment },
      });
    } else {
      // Cria novo se não existe
      console.log("[Compliance] Creating new override");
      override = await prisma.complianceOverride.create({
        data: { companyId, itemId, status, comment },
      });
    }

    console.log("[Compliance] Override saved successfully:", override);
    return NextResponse.json(override, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Compliance] Error saving override:", errorMessage);
    console.error("[Compliance] Full error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyId = (session.user as { companyId: string }).companyId;

  try {
    const overrides = await prisma.complianceOverride.findMany({
      where: { companyId },
    });

    return NextResponse.json(overrides);
  } catch (error) {
    console.error("Error fetching compliance overrides:", error);
    return NextResponse.json({ error: "Erro ao buscar" }, { status: 500 });
  }
}
