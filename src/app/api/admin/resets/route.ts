import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.passwordResetRequest.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Fetch reset requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, userId, newPassword } = await req.json();

    if (!requestId || !userId || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Transaction to update password and mark request as resolved
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetRequest.update({
        where: { id: requestId },
        data: { status: "RESOLVED" }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resolve reset request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
