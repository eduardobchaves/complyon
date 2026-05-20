import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["OPEN", "UNDER_REVIEW", "COMPLETED"]).optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = (session.user as { companyId: string }).companyId;
  const { id } = await params;

  const complaint = await prisma.complaint.findFirst({ where: { id, companyId } });
  if (!complaint) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(complaint);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = (session.user as { companyId: string }).companyId;
  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const complaint = await prisma.complaint.findFirst({ where: { id, companyId } });
  if (!complaint) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.complaint.update({
    where: { id },
    data: {
      ...(parsed.data.status && { status: parsed.data.status }),
      ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
      ...(parsed.data.status === "COMPLETED" && { completedAt: new Date() }),
      ...(parsed.data.status === "UNDER_REVIEW" && { reviewedAt: new Date() }),
    },
  });

  return NextResponse.json(updated);
}
