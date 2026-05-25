import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: { email },
      include: { company: true },
    });

    const companies = users
      .filter((user) => user.company)
      .map((user) => ({
        slug: user.company!.slug,
        name: user.company!.name,
      }));

    return NextResponse.json({ companies });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
