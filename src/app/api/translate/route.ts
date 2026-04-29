import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslation } from "@/lib/translate";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, sourceLang, targetLang } = await req.json();

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Use dataset-based translation instead of Gemini API
    const result = await getTranslation(text, sourceLang, targetLang);

    // Try to save to database, but don't fail translation if DB fails (e.g., local test without DB)
    try {
      await prisma.translation.create({
        data: {
          userId: session.userId,
          sourceText: text,
          translatedText: result.translation,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        }
      });
    } catch (dbError) {
      console.error("Failed to save translation history to database:", dbError);
    }

    return NextResponse.json({
      translation: result.translation,
      confidence: result.confidence,
      matchType: result.matchType,
      sourceMatch: result.sourceMatch,
      languageWarning: result.languageWarning,
      detectedLang: result.detectedLang,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
