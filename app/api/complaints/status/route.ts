import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const protocol = req.nextUrl.searchParams.get("protocol");
  if (!protocol) return NextResponse.json({ error: "Protocol required" }, { status: 400 });

  const complaint = await prisma.complaint.findUnique({
    where: { protocol: protocol.toUpperCase() },
    select: {
      protocol: true,
      category: true,
      status: true,
      createdAt: true,
      reviewedAt: true,
      completedAt: true,
    },
  });

  if (!complaint) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(complaint);
}
