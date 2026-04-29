"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, History, LogOut, Loader2, Copy, Check, Settings, Sun, Moon, Languages, AlertTriangle, X, SearchX } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/lib/theme";

export default function TranslatePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("Filipino");
  const [targetLang, setTargetLang] = useState("Teduray");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState("User");
  const [isAdmin, setIsAdmin] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [matchType, setMatchType] = useState<string | null>(null);
  const [languageWarning, setLanguageWarning] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [noMatch, setNoMatch] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push("/login");
        } else {
          setUserName(data.user.name);
          setIsAdmin(data.user.role === "admin");
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const swapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
    setConfidence(null);
    setMatchType(null);
    setLanguageWarning(null);
    setShowWarning(false);
    setNoMatch(false);
  };

  const handleSwitchToDetectedLang = () => {
    if (detectedLang) {
      setSourceLang(detectedLang);
      setShowWarning(false);
      setLanguageWarning(null);
      setTimeout(() => handleTranslate(), 100);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setConfidence(null);
    setMatchType(null);
    setLanguageWarning(null);
    setShowWarning(false);
    setNoMatch(false);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText,
          sourceLang: sourceLang,
          targetLang: targetLang,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTranslatedText(data.translation);
        setConfidence(data.confidence ?? null);
        setMatchType(data.matchType ?? null);

        // Check if no match or very low confidence
        if (data.matchType === "none" || (data.confidence !== null && data.confidence < 30)) {
          setNoMatch(true);
        }

        if (data.languageWarning) {
          setLanguageWarning(data.languageWarning);
          setDetectedLang(data.detectedLang ?? null);
          setShowWarning(true);
        }
      } else {
        setTranslatedText("Error: " + data.error);
        setConfidence(null);
        setMatchType(null);
      }
    } catch (error) {
      setTranslatedText("An error occurred during translation.");
      setConfidence(null);
      setMatchType(null);
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConfidenceColor = () => {
    if (confidence === null) return "";
    if (confidence >= 90) return "text-teal-600 dark:text-teal-400";
    if (confidence >= 70) return "text-amber-600 dark:text-amber-400";
    return "text-red-500 dark:text-red-400";
  };

  const getConfidenceBarColor = () => {
    if (confidence === null) return "";
    if (confidence >= 90) return "bg-teal-500";
    if (confidence >= 70) return "bg-amber-500";
    return "bg-red-400";
  };

  const getConfidenceLabel = () => {
    if (confidence === null) return "";
    if (confidence === 100) return "Exact match";
    if (confidence >= 90) return "Very close match";
    if (confidence >= 70) return "Partial match";
    if (confidence >= 50) return "Low match";
    return "Very low match";
  };

  return (
    <div className="min-h-screen flex flex-col page-transition" style={{ background: "var(--bg-primary)" }}>
      {/* ===== Top Navigation ===== */}
      <nav style={{ background: "var(--header-bg)" }} className="shadow-lg relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 left-1/4 w-24 h-24 bg-white/5 rounded-full" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                <Languages className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight tracking-tight">Teduray Translator</h1>
                <p className="text-white/60 text-[11px] font-medium tracking-wide">Machine Translation System</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-white/60 text-sm mr-2 hidden sm:inline">
                Welcome, <span className="text-white font-semibold">{userName}</span>
              </span>

              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-white/10 rounded-xl transition-all theme-toggle"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-yellow-300" />
                ) : (
                  <Moon className="w-5 h-5 text-white/70" />
                )}
              </button>

              {isAdmin && (
                <Link href="/admin" className="p-2 hover:bg-white/10 rounded-xl transition-colors" title="Admin Dashboard">
                  <Settings className="w-5 h-5 text-white/70" />
                </Link>
              )}
              <Link href="/history" className="p-2 hover:bg-white/10 rounded-xl transition-colors" title="Translation History">
                <History className="w-5 h-5 text-white/70" />
              </Link>
              <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-xl transition-colors" title="Logout">
                <LogOut className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Language Mismatch Warning Modal ===== */}
      {showWarning && languageWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}>
          <div className="card w-full max-w-md p-6 shadow-2xl" style={{ animation: "fadeIn 0.2s ease-out" }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>
                  Wrong Language Detected
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {languageWarning}
                </p>
              </div>
              <button onClick={() => setShowWarning(false)} className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSwitchToDetectedLang}
                className="flex-1 btn-primary font-semibold py-2.5 px-4 rounded-xl text-sm"
              >
                Switch to {detectedLang}
              </button>
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all active:scale-95"
                style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
              >
                Keep {sourceLang}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Main Content ===== */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-3xl">

          {/* Language Selector Card */}
          <div className="card p-5 mb-5">
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              <div className="flex-1 max-w-[200px]">
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-2 text-center" style={{ color: "var(--text-muted)" }}>
                  From
                </label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 font-semibold text-center focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 cursor-pointer transition-all text-sm"
                  style={{ borderColor: "var(--border-input)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                >
                  <option value="Filipino">Filipino</option>
                  <option value="Teduray">Teduray</option>
                  <option value="English">English</option>
                </select>
              </div>

              <button
                onClick={swapLanguages}
                className="mt-6 w-11 h-11 flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-90 hover:shadow-md"
                style={{ background: "var(--accent-gradient)" }}
                title="Swap Languages"
              >
                <ArrowLeftRight className="w-4 h-4 text-white" />
              </button>

              <div className="flex-1 max-w-[200px]">
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-2 text-center" style={{ color: "var(--text-muted)" }}>
                  To
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 font-semibold text-center focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 cursor-pointer transition-all text-sm"
                  style={{ borderColor: "var(--border-input)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                >
                  <option value="Filipino">Filipino</option>
                  <option value="Teduray">Teduray</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Input Card */}
          <div className="card overflow-hidden mb-5">
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)" }}>
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                {sourceLang} — Input
              </span>
              <span className="text-[11px] font-semibold tabular-nums" style={{ color: "var(--text-muted)" }}>
                {sourceText.length} characters
              </span>
            </div>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Type or paste text to translate..."
              className="w-full p-5 min-h-[140px] resize-none focus:outline-none text-base leading-relaxed"
              style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Translate Button */}
          <div className="flex justify-center mb-5">
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !sourceText.trim()}
              className="btn-primary font-bold py-3.5 px-14 rounded-2xl flex items-center gap-3 text-base shadow-lg"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="w-5 h-5" />
                  Translate
                </>
              )}
            </button>
          </div>

          {/* Output Card */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)" }}>
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                {targetLang} — Translation
              </span>
              {translatedText && !noMatch && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10"
                  style={{ color: copied ? "var(--success-color)" : "var(--text-muted)" }}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>

            {/* Translation Result */}
            <div className="p-5 min-h-[120px]">
              {noMatch ? (
                /* ===== No Match State ===== */
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--bg-tertiary)" }}>
                    <SearchX className="w-7 h-7" style={{ color: "var(--text-muted)" }} />
                  </div>
                  <h3 className="font-bold text-base mb-1.5" style={{ color: "var(--text-primary)" }}>
                    No translation found
                  </h3>
                  <p className="text-sm max-w-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    We couldn&apos;t find a match for this text in our dataset. Try a different word or phrase.
                  </p>
                </div>
              ) : translatedText ? (
                <p className="text-lg leading-relaxed" style={{ color: "var(--text-primary)" }}>{translatedText}</p>
              ) : (
                <p className="italic text-sm" style={{ color: "var(--text-muted)" }}>
                  Translation will appear here...
                </p>
              )}
            </div>

            {/* Confidence Bar — only show for successful matches */}
            {confidence !== null && !noMatch && matchType !== "none" && (
              <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border-color)", background: "var(--bg-tertiary)" }}>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
                    <div
                      className={`h-full rounded-full confidence-bar ${getConfidenceBarColor()}`}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${getConfidenceColor()}`}>
                    {confidence}%
                  </span>
                </div>
                <p className={`text-xs mt-1.5 font-semibold ${getConfidenceColor()}`}>
                  {getConfidenceLabel()}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          
        </div>
      </main>
    </div>
  );
}
