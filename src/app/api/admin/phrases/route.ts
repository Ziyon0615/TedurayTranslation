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

    const phrases = await prisma.datasetEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ phrases });
  } catch (error) {
    console.error("Fetch phrases error:", error);
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
    const { tedurayPhrase, filipinoTranslation, englishTranslation } = body;

    if (!tedurayPhrase || !filipinoTranslation || !englishTranslation) {
      return NextResponse.json({ error: "All three language fields are required" }, { status: 400 });
    }

    const phrase = await prisma.datasetEntry.create({
      data: {
        teduray: tedurayPhrase,
        tagalog: filipinoTranslation,
        english: englishTranslation,
        tedurayNormalized: normalize(tedurayPhrase),
        tagalogNormalized: normalize(filipinoTranslation),
        englishNormalized: normalize(englishTranslation),
      }
    });

    return NextResponse.json({ success: true, phrase }, { status: 201 });
  } catch (error) {
    console.error("Create phrase error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
