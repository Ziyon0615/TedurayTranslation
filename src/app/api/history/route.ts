import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const history = await prisma.translation.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return NextResponse.json({ history });
    } catch (dbError) {
      console.error("Database error while fetching history:", dbError);
      return NextResponse.json({ history: [], warning: "Could not fetch from database. Is it configured?" });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
