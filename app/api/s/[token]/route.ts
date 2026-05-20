import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const record = await prisma.surveyToken.findUnique({
    where: { token },
    include: { survey: true },
  });

  if (!record) return NextResponse.json({ error: "invalid" }, { status: 404 });
  if (record.usedAt) return NextResponse.json({ error: "used" }, { status: 410 });
  if (record.survey.status !== "ACTIVE") return NextResponse.json({ error: "closed" }, { status: 403 });

  return NextResponse.json({
    survey: { id: record.survey.id, title: record.survey.title, status: record.survey.status },
  });
}
