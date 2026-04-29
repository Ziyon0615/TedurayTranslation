"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, UserPlus, Languages, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function RegisterPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
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

      {/* Left Side — Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12"
        style={{ background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)" }}>
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <UserPlus className="text-white w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Us
          </h2>
          <p className="text-teal-100 text-lg leading-relaxed">
            Create your account to start translating between English, Filipino, and Teduray. Save your translation history and access the system anytime.
          </p>
        </div>
      </div>

      {/* Right Side — Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <UserPlus className="text-white w-8 h-8" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Create Account</h1>
          <p className="mb-8" style={{ color: "var(--text-muted)" }}>Join to start translating and saving history</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-sm text-center border border-red-100 dark:border-red-800">
                {error}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                style={{ borderColor: "var(--border-input)", background: "var(--bg-input)", color: "var(--text-input)" }}
                placeholder="Juan Dela Cruz"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                style={{ borderColor: "var(--border-input)", background: "var(--bg-input)", color: "var(--text-input)" }}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                style={{ borderColor: "var(--border-input)", background: "var(--bg-input)", color: "var(--text-input)" }}
                placeholder="Create a strong password"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-lg"
            >
              {isLoading ? "Creating account..." : "Register"}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Already have an account?{" "}
              <Link href="/login" className="text-teal-600 font-semibold hover:underline dark:text-teal-400">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
