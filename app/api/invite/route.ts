import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInviteEmail } from "@/lib/resend";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const companyId = (session.user as { companyId: string }).companyId;
  const { employeeId } = await req.json();

  const employee = await prisma.user.findFirst({
    where: { id: employeeId, companyId },
    include: { company: true },
  });

  if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: employeeId },
    data: { inviteToken: token, invitedAt: new Date() },
  });

  await sendInviteEmail({
    to: employee.email,
    name: employee.name || employee.email,
    companyName: employee.company.name,
    token,
  });

  return NextResponse.json({ ok: true });
}
