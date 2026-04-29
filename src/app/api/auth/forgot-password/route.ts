import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email or username" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't leak whether the user exists or not
      return NextResponse.json({ success: true });
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.passwordResetRequest.findFirst({
      where: { userId: user.id, status: "PENDING" },
    });

    if (!existingRequest) {
      await prisma.passwordResetRequest.create({
        data: {
          userId: user.id,
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
