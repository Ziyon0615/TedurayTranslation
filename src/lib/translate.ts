import { prisma } from "./prisma";

/**
 * Normalize text for comparison: lowercase, remove punctuation, trim.
 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

/**
 * Compute Levenshtein distance between two strings.
 * This measures the minimum number of single-character edits
 * (insertions, deletions, substitutions) needed to change one string into the other.
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  // Optimize: if one string is empty, distance = length of the other
  if (m === 0) return n;
  if (n === 0) return m;

  // Use two rows instead of full matrix for memory efficiency
  let prevRow = Array.from({ length: n + 1 }, (_, i) => i);
  let currRow = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    currRow[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,       // deletion
        currRow[j - 1] + 1,   // insertion
        prevRow[j - 1] + cost  // substitution
      );
    }
    [prevRow, currRow] = [currRow, prevRow];
  }

  return prevRow[n];
}

/**
 * Calculate similarity percentage between two strings (0-100).
 */
function similarity(a: string, b: string): number {
  const normalA = normalize(a);
  const normalB = normalize(b);

  if (normalA === normalB) return 100;
  if (normalA.length === 0 || normalB.length === 0) return 0;

  const distance = levenshteinDistance(normalA, normalB);
  const maxLen = Math.max(normalA.length, normalB.length);
  return Math.round(((maxLen - distance) / maxLen) * 100);
}

/**
 * Map language name to the database column field.
 */
function langToField(lang: string): "english" | "tagalog" | "teduray" {
  const l = lang.toLowerCase();
  if (l === "english") return "english";
  if (l === "filipino" || l === "tagalog") return "tagalog";
  if (l === "teduray") return "teduray";
  throw new Error(`Unsupported language: ${lang}`);
}

function langToNormalizedField(lang: string): "englishNormalized" | "tagalogNormalized" | "tedurayNormalized" {
  const l = lang.toLowerCase();
  if (l === "english") return "englishNormalized";
  if (l === "filipino" || l === "tagalog") return "tagalogNormalized";
  if (l === "teduray") return "tedurayNormalized";
  throw new Error(`Unsupported language: ${lang}`);
}

export interface TranslationResult {
  translation: string;
  confidence: number;
  matchType: "exact" | "fuzzy" | "none";
  sourceMatch?: string;
  languageWarning?: string;
  detectedLang?: string;
}

/**
 * Detect if the input text actually belongs to a different language column.
 * Uses both exact and fuzzy matching for comprehensive detection.
 * Works for ALL language directions: Filipino↔English↔Teduray.
 */
async function detectLanguageMismatch(
  text: string,
  declaredSourceLang: string
): Promise<{ detectedLang: string; fieldName: string } | null> {
  const normalizedInput = normalize(text);
  if (!normalizedInput) return null;

  const declaredField = langToNormalizedField(declaredSourceLang);
  const declaredRawField = langToField(declaredSourceLang);

  const languages: { name: string; normalizedField: "englishNormalized" | "tagalogNormalized" | "tedurayNormalized"; rawField: "english" | "tagalog" | "teduray" }[] = [
    { name: "English", normalizedField: "englishNormalized", rawField: "english" },
    { name: "Filipino", normalizedField: "tagalogNormalized", rawField: "tagalog" },
    { name: "Teduray", normalizedField: "tedurayNormalized", rawField: "teduray" },
  ];

  // Step 1: Check for exact match in a different language column
  for (const lang of languages) {
    if (lang.normalizedField === declaredField) continue;

    const match = await prisma.datasetEntry.findFirst({
      where: { [lang.normalizedField]: normalizedInput },
    });

    if (match) {
      // Confirm there's NO exact match in the declared source language
      const declaredMatch = await prisma.datasetEntry.findFirst({
        where: { [declaredField]: normalizedInput },
      });

      if (!declaredMatch) {
        return { detectedLang: lang.name, fieldName: lang.normalizedField };
      }
    }
  }

  // Step 2: Fuzzy check — sample entries and compare similarity scores across languages
  const sample = await prisma.datasetEntry.findMany({ take: 200 });
  
  let bestDeclaredScore = 0;
  let bestOtherScore = 0;
  let bestOtherLang = "";

  for (const entry of sample) {
    // Score against declared source language
    const declaredScore = similarity(text, entry[declaredRawField]);
    if (declaredScore > bestDeclaredScore) bestDeclaredScore = declaredScore;

    // Score against other languages
    for (const lang of languages) {
      if (lang.normalizedField === declaredField) continue;
      const score = similarity(text, entry[lang.rawField]);
      if (score > bestOtherScore) {
        bestOtherScore = score;
        bestOtherLang = lang.name;
      }
    }
  }

  // If another language scores much higher than the declared one, flag it
  if (bestOtherScore >= 80 && bestOtherScore - bestDeclaredScore >= 30) {
    return { detectedLang: bestOtherLang, fieldName: "" };
  }

  return null;
}

/**
 * Main translation function.
 * Searches the dataset for the best matching translation.
 */
export async function getTranslation(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {
  const sourceField = langToField(sourceLang);
  const targetField = langToField(targetLang);
  const normalizedField = langToNormalizedField(sourceLang);
  const normalizedInput = normalize(text);

  if (!normalizedInput) {
    return { translation: "", confidence: 0, matchType: "none" };
  }

  // Check for language mismatch before translating
  const mismatch = await detectLanguageMismatch(text, sourceLang);
  let languageWarning: string | undefined;
  let detectedLang: string | undefined;
  if (mismatch) {
    languageWarning = `It looks like your text is in ${mismatch.detectedLang}, not ${sourceLang}. Please switch the source language to ${mismatch.detectedLang} for a better translation.`;
    detectedLang = mismatch.detectedLang;
  }

  // Step 1: Try exact match on normalized field
  const exactMatch = await prisma.datasetEntry.findFirst({
    where: { [normalizedField]: normalizedInput },
  });

  if (exactMatch) {
    return {
      translation: exactMatch[targetField],
      confidence: 100,
      matchType: "exact",
      sourceMatch: exactMatch[sourceField],
      languageWarning,
      detectedLang,
    };
  }

  // Step 2: Try "contains" match — maybe it's part of a longer phrase or vice versa
  const containsMatches = await prisma.datasetEntry.findMany({
    where: {
      OR: [
        { [normalizedField]: { contains: normalizedInput } },
      ],
    },
    take: 20,
  });

  if (containsMatches.length > 0) {
    // Find the closest one by similarity
    let bestMatch = containsMatches[0];
    let bestScore = similarity(text, bestMatch[sourceField]);

    for (const entry of containsMatches) {
      const score = similarity(text, entry[sourceField]);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    }

    if (bestScore >= 50) {
      return {
        translation: bestMatch[targetField],
        confidence: bestScore,
        matchType: bestScore === 100 ? "exact" : "fuzzy",
        sourceMatch: bestMatch[sourceField],
        languageWarning,
        detectedLang,
      };
    }
  }

  // Step 3: Fuzzy search — load a sample and find the best Levenshtein match
  // To keep it efficient, we search in chunks
  const totalEntries = await prisma.datasetEntry.count();
  const CHUNK_SIZE = 1000;

  let globalBestMatch: { entry: any; score: number } | null = null;

  for (let skip = 0; skip < totalEntries; skip += CHUNK_SIZE) {
    const chunk = await prisma.datasetEntry.findMany({
      skip,
      take: CHUNK_SIZE,
    });

    for (const entry of chunk) {
      const score = similarity(text, entry[sourceField]);

      if (!globalBestMatch || score > globalBestMatch.score) {
        globalBestMatch = { entry, score };
      }

      // Early exit if we found a very high match
      if (score >= 95) break;
    }

    if (globalBestMatch && globalBestMatch.score >= 95) break;
  }

  if (globalBestMatch && globalBestMatch.score >= 40) {
    return {
      translation: globalBestMatch.entry[targetField],
      confidence: globalBestMatch.score,
      matchType: "fuzzy",
      sourceMatch: globalBestMatch.entry[sourceField],
      languageWarning,
      detectedLang,
    };
  }

  return {
    translation: "No translation found. Try a different phrase.",
    confidence: 0,
    matchType: "none",
    languageWarning,
    detectedLang,
  };
}
