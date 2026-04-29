"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, AlertCircle, Languages, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface TranslationRecord {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [history, setHistory] = useState<TranslationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.history) {
          setHistory(data.history);
        }
        if (data.warning) {
          setWarning(data.warning);
        }
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [router]);

  return (
    <div className="min-h-screen page-transition" style={{ background: "var(--bg-primary)" }}>
      {/* Navigation */}
      <nav style={{ background: "var(--header-bg)" }} className="shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/translate" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-200" />
                <h1 className="text-white font-bold text-lg">Translation History</h1>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-white/10 rounded-lg transition-all theme-toggle"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-300" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-200" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {warning && (
          <div className="mb-6 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 p-4 rounded-xl text-sm flex items-start gap-2 border border-orange-200 dark:border-orange-800/50">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{warning} History may not be saved.</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3" style={{ color: "var(--text-muted)" }}>
              <Clock className="w-10 h-10 opacity-50 animate-pulse" />
              <span className="text-sm">Loading history...</span>
            </div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
              <Clock className="w-10 h-10" style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="font-semibold text-xl mb-1" style={{ color: "var(--text-primary)" }}>No translations yet</p>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Your translation history will appear here.</p>
            <Link
              href="/translate"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Start Translating
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {history.map((record) => (
              <div key={record.id} className="card p-5 hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg">
                    {record.sourceLanguage} &rarr; {record.targetLanguage}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(record.createdAt).toLocaleDateString()} {new Date(record.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Source</p>
                  <p style={{ color: "var(--text-primary)" }}>{record.sourceText}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Translation</p>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{record.translatedText}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
