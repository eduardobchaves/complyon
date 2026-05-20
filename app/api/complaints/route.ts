import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const complaintSchema = z.object({
  companySlug: z.string(),
  category: z.enum(["MORAL_HARASSMENT","SEXUAL_HARASSMENT","FRAUD_CORRUPTION","NORM_VIOLATION","INTERPERSONAL_CONFLICT","DISCRIMINATION","OTHER"]),
  description: z.string().min(20).max(5000),
  attachmentUrl: z.string().url().optional(),
});

function generateProtocol(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = (session.user as { companyId: string }).companyId;

  const complaints = await prisma.complaint.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(complaints);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = complaintSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { companySlug, category, description, attachmentUrl } = parsed.data;

  const company = await prisma.company.findUnique({ where: { slug: companySlug } });
  if (!company) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

  let protocol = generateProtocol();
  let attempts = 0;
  while (attempts < 5) {
    const exists = await prisma.complaint.findUnique({ where: { protocol } });
    if (!exists) break;
    protocol = generateProtocol();
    attempts++;
  }

  // IMPORTANT: No user data, IP, or identifying information is stored
  const complaint = await prisma.complaint.create({
    data: {
      protocol,
      companyId: company.id,
      category,
      description,
      ...(attachmentUrl && { notes: `Anexo: ${attachmentUrl}` }),
      status: "OPEN",
    },
  });

  return NextResponse.json({ protocol: complaint.protocol, id: complaint.id }, { status: 201 });
}
