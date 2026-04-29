"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Languages, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();

        if (meData.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/translate");
        }
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex page-transition" style={{ background: "var(--bg-primary)" }}>
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
          <Moon className="w-5 h-5 text-teal-600" />
        )}
      </button>

      {/* Left Side — Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12"
        style={{ background: "var(--header-bg)" }}>
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Languages className="text-white w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Teduray Translator
          </h2>
          <p className="text-teal-100 text-lg leading-relaxed">
            A neural network-based machine translation system for English, Filipino, and Teduray languages.
          </p>
          <div className="mt-8 flex justify-center gap-4">

          </div>
        </div>
      </div>

      {/* Right Side — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg" style={{ background: "var(--accent-gradient)" }}>
              <Languages className="text-white w-8 h-8" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Welcome Back</h1>
          <p className="mb-8" style={{ color: "var(--text-muted)" }}>Sign in to continue translating</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-sm text-center border border-red-100 dark:border-red-800">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Username: Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                style={{ borderColor: "var(--border-input)", background: "var(--bg-input)", color: "var(--text-input)" }}
                placeholder="Enter your email or username"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  style={{ borderColor: "var(--border-input)", background: "var(--bg-input)", color: "var(--text-input)" }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Link href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-500 dark:text-teal-400 mt-1 self-end">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 btn-primary font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-lg"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Don't have an account?{" "}
              <Link href="/register" className="text-teal-600 font-semibold hover:underline dark:text-teal-400">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
