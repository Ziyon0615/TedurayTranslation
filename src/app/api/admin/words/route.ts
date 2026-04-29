import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const words = await prisma.datasetEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ words });
  } catch (error) {
    console.error("Fetch words error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tedurayWord, filipinoTranslation, englishTranslation } = body;

    if (!tedurayWord || !filipinoTranslation || !englishTranslation) {
      return NextResponse.json({ error: "All three language fields are required" }, { status: 400 });
    }

    const word = await prisma.datasetEntry.create({
      data: {
        teduray: tedurayWord,
        tagalog: filipinoTranslation,
        english: englishTranslation,
        tedurayNormalized: normalize(tedurayWord),
        tagalogNormalized: normalize(filipinoTranslation),
        englishNormalized: normalize(englishTranslation),
      }
    });

    return NextResponse.json({ success: true, word }, { status: 201 });
  } catch (error) {
    console.error("Create word error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
