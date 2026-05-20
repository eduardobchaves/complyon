import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const overrideSchema = z.object({
  itemId: z.string(),
  status: z.enum(["ok", "pending", "attention"]),
  comment: z.string().min(1, "Comentário é obrigatório ao alterar o status"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = (session.user as { companyId: string }).companyId;

  const overrides = await prisma.complianceOverride.findMany({
    where: { companyId },
  });

  return NextResponse.json(overrides);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = (session.user as { companyId: string }).companyId;
  const body = await req.json();
  const parsed = overrideSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { itemId, status, comment } = parsed.data;

  const override = await prisma.complianceOverride.upsert({
    where: { companyId_itemId: { companyId, itemId } },
    update: { status, comment },
    create: { companyId, itemId, status, comment },
  });

  return NextResponse.json(override);
}
