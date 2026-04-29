"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 page-transition" style={{ background: "var(--bg-primary)" }}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 p-2.5 rounded-xl transition-all theme-toggle z-50"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-600" />
        )}
      </button>

      <div className="w-full max-w-md">
        <Link href="/login" className="flex items-center gap-2 mb-8 self-start transition-colors text-sm font-medium"
          style={{ color: "var(--text-muted)" }}>
          <ArrowLeft className="w-4 h-4" />
          <span>Back to login</span>
        </Link>

        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Reset Password</h1>
          <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
            Enter your email or username and we will send a reset request to the administrator.
          </p>

          {isSuccess ? (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
              <h3 className="text-green-800 dark:text-green-300 font-bold mb-2">Request Sent!</h3>
              <p className="text-green-600 dark:text-green-400 text-sm">
                The administrator has been notified. Please contact them to get your new password.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all w-full"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Email or Username</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  style={{ borderColor: "var(--border-input)", background: "var(--bg-input)", color: "var(--text-input)" }}
                  placeholder="Enter your email or username"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-lg"
              >
                {isSubmitting ? "Sending Request..." : "Send Reset Request"}
                {!isSubmitting && <Send className="w-5 h-5" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
