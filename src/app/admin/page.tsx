"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Trash2, KeyRound, Loader2, Search, ArrowLeft, Eye, X, BookOpen, Plus, CheckCircle, XCircle, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/lib/theme";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { translations: number };
  translations: any[];
}

interface ResetRequest {
  id: string;
  userId: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
}

interface DatasetItem {
  id: string;
  english: string;
  tagalog: string;
  teduray: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [resetRequests, setResetRequests] = useState<ResetRequest[]>([]);
  const [words, setWords] = useState<DatasetItem[]>([]);
  const [phrases, setPhrases] = useState<DatasetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "resets" | "words" | "phrases">("users");
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddWordForm, setShowAddWordForm] = useState(false);
  const [showAddPhraseForm, setShowAddPhraseForm] = useState(false);

  const [wordForm, setWordForm] = useState({
    tedurayWord: "",
    filipinoTranslation: "",
    englishTranslation: "",
  });

  const [phraseForm, setPhraseForm] = useState({
    tedurayPhrase: "",
    filipinoTranslation: "",
    englishTranslation: "",
  });

  // Password reset modal state
  const [resetTarget, setResetTarget] = useState<{ requestId: string; userId: string; userName: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, resetsRes, wordsRes, phrasesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/resets"),
        fetch("/api/admin/words"),
        fetch("/api/admin/phrases")
      ]);

      if (usersRes.status === 401) {
        router.push("/login");
        return;
      }

      const usersData = await usersRes.json();
      const resetsData = await resetsRes.json();
      const wordsData = await wordsRes.json();
      const phrasesData = await phrasesRes.json();

      setUsers(usersData.users || []);
      setResetRequests(resetsData.requests || []);
      setWords(wordsData.words || []);
      setPhrases(phrasesData.phrases || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to completely delete this user and all their translation history?")) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      const action = currentStatus ? 'deactivate' : 'activate';
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, isActive: !currentStatus } : u));
      } else {
        alert("Failed to update user status");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating user status");
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wordForm)
      });
      if (res.ok) {
        const data = await res.json();
        setWords([data.word, ...words]);
        setWordForm({ tedurayWord: "", filipinoTranslation: "", englishTranslation: "" });
        setShowAddWordForm(false);
        alert("Word added to dataset successfully! It is now available for translation.");
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to add word");
      }
    } catch (error) {
      console.error(error);
      alert("Error adding word");
    }
  };

  const handleAddPhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(phraseForm)
      });
      if (res.ok) {
        const data = await res.json();
        setPhrases([data.phrase, ...phrases]);
        setPhraseForm({ tedurayPhrase: "", filipinoTranslation: "", englishTranslation: "" });
        setShowAddPhraseForm(false);
        alert("Phrase added to dataset successfully! It is now available for translation.");
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to add phrase");
      }
    } catch (error) {
      console.error(error);
      alert("Error adding phrase");
    }
  };

  const handleDeleteWord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this word?")) return;
    try {
      const res = await fetch(`/api/admin/words/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWords(words.filter(w => w.id !== id));
      } else {
        const errorData = await res.json();
        alert(`Failed to delete word: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error(error);
      alert(`Failed to delete word: ${error}`);
    }
  };

  const handleDeletePhrase = async (id: string) => {
    if (!confirm("Are you sure you want to delete this phrase?")) return;
    try {
      const res = await fetch(`/api/admin/phrases/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPhrases(phrases.filter(p => p.id !== id));
      } else {
        const errorData = await res.json();
        alert(`Failed to delete phrase: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error(error);
      alert(`Failed to delete phrase: ${error}`);
    }
  };

  const handleResolveReset = async () => {
    if (!resetTarget || !newPassword.trim()) return;
    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/resets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: resetTarget.requestId, userId: resetTarget.userId, newPassword }),
      });

      if (res.ok) {
        alert("Password updated successfully! Please share the new password securely with the user.");
        setResetRequests(resetRequests.filter(r => r.id !== resetTarget.requestId));
        setResetTarget(null);
        setNewPassword("");
      } else {
        alert("Failed to reset password");
      }
    } catch (error) {
      console.error(error);
      alert("Error resetting password");
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-transition" style={{ background: "var(--bg-primary)" }}>
      <nav style={{ background: "var(--header-bg)" }} className="shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/translate" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <h1 className="text-white font-bold text-lg">Admin Dashboard</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto">
          <button 
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "users" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            <Users className="w-4 h-4" />
            Manage Users
          </button>
          <button 
            onClick={() => setActiveTab("resets")}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "resets" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            <KeyRound className="w-4 h-4" />
            Password Resets
            {resetRequests.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{resetRequests.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab("words")}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "words" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            <BookOpen className="w-4 h-4" />
            Words
          </button>
          <button 
            onClick={() => setActiveTab("phrases")}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "phrases" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            <BookOpen className="w-4 h-4" />
            Phrases
          </button>
        </div>

        {activeTab === "users" && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/50 uppercase text-xs font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Translations</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 w-fit ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                          {user.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user._count.translations}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="View Logs"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {user.role !== 'admin' && (
                            <>
                              <button 
                                onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'}`}
                                title={user.isActive ? "Deactivate User" : "Activate User"}
                              >
                                {user.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "resets" && (
          <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resetRequests.map(request => (
                <div key={request.id} className="card p-5" style={{ borderColor: "var(--border-color)" }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <span className="text-xs px-2 py-1 rounded" style={{ color: "var(--text-muted)", background: "var(--bg-tertiary)" }}>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{request.user.name}</h3>
                  <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>{request.user.email}</p>
                  <button 
                    onClick={() => setResetTarget({ requestId: request.id, userId: request.userId, userName: request.user.name })}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                  >
                    Set New Password
                  </button>
                </div>
              ))}
              {resetRequests.length === 0 && (
                <div className="col-span-full py-12 text-center" style={{ color: "var(--text-muted)" }}>
                  No pending password reset requests.
                </div>
              )}
            </div>

            {/* Password Reset Modal */}
            {resetTarget && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
                <div className="card w-full max-w-md p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                      <KeyRound className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Reset Password</h3>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>for {resetTarget.userName}</p>
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>New Password</label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password..."
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      style={{ borderColor: "var(--border-input)", background: "var(--bg-input)", color: "var(--text-input)" }}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleResolveReset}
                      disabled={!newPassword.trim() || isResetting}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50"
                    >
                      {isResetting ? "Updating..." : "Update Password"}
                    </button>
                    <button
                      onClick={() => { setResetTarget(null); setNewPassword(""); }}
                      className="flex-1 py-2.5 px-4 rounded-xl font-semibold transition-all"
                      style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "words" && (
          <div className="space-y-4">
            <button
              onClick={() => setShowAddWordForm(!showAddWordForm)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Word
            </button>

            {showAddWordForm && (
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Add New Word to Dataset</h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>This word will be saved directly to the translation dataset and become immediately available for translation.</p>
                <form onSubmit={handleAddWord} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Teduray</label>
                      <input type="text" placeholder="e.g. Momaruo" value={wordForm.tedurayWord} onChange={(e) => setWordForm({...wordForm, tedurayWord: e.target.value})} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" style={{ borderColor: "var(--border-input)", background: "var(--bg-input)", color: "var(--text-input)" }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Filipino</label>
                      <input type="text" placeholder="e.g. Magandang umaga" value={wordForm.filipinoTranslation} onChange={(e) => setWordForm({...wordForm, filipinoTranslation: e.target.value})} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" style={{ borderColor: "var(--border-input)", background: "var(--bg-input)", color: "var(--text-input)" }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>English</label>
                      <input type="text" placeholder="e.g. Good morning" value={wordForm.englishTranslation} onChange={(e) => setWordForm({...wordForm, englishTranslation: e.target.value})} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" style={{ borderColor: "var(--border-input)", background: "var(--bg-input)", color: "var(--text-input)" }} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowAddWordForm(false)} className="px-4 py-2 border font-medium rounded-lg transition-colors" style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">Add Word</button>
                  </div>
                </form>
              </div>
            )}

            {words.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm" style={{ color: "var(--text-secondary)" }}>
                    <thead style={{ background: "var(--bg-tertiary)" }}>
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Teduray</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Filipino</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase" style={{ color: "var(--text-secondary)" }}>English</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {words.map(word => (
                        <tr key={word.id} className="border-t" style={{ borderColor: "var(--border-color)" }}>
                          <td className="px-6 py-4 font-medium" style={{ color: "var(--text-primary)" }}>{word.teduray}</td>
                          <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>{word.tagalog}</td>
                          <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>{word.english}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDeleteWord(word.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>No words found. Add your first word!</div>
            )}
          </div>
        )}

        {activeTab === "phrases" && (
          <div className="space-y-4">
            <button
              onClick={() => setShowAddPhraseForm(!showAddPhraseForm)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Phrase
            </button>

            {showAddPhraseForm && (
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Add New Phrase to Dataset</h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>This phrase will be saved directly to the translation dataset and become immediately available for translation.</p>
                <form onSubmit={handleAddPhrase} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Teduray</label>
                      <input type="text" placeholder="e.g. Momaruo dou" value={phraseForm.tedurayPhrase} onChange={(e) => setPhraseForm({...phraseForm, tedurayPhrase: e.target.value})} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" style={{ borderColor: "var(--border-input)", background: "var(--bg-input)", color: "var(--text-input)" }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Filipino</label>
                      <input type="text" placeholder="e.g. Kumusta ka" value={phraseForm.filipinoTranslation} onChange={(e) => setPhraseForm({...phraseForm, filipinoTranslation: e.target.value})} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" style={{ borderColor: "var(--border-input)", background: "var(--bg-input)", color: "var(--text-input)" }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>English</label>
                      <input type="text" placeholder="e.g. How are you" value={phraseForm.englishTranslation} onChange={(e) => setPhraseForm({...phraseForm, englishTranslation: e.target.value})} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" style={{ borderColor: "var(--border-input)", background: "var(--bg-input)", color: "var(--text-input)" }} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowAddPhraseForm(false)} className="px-4 py-2 border font-medium rounded-lg transition-colors" style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">Add Phrase</button>
                  </div>
                </form>
              </div>
            )}

            {phrases.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm" style={{ color: "var(--text-secondary)" }}>
                    <thead style={{ background: "var(--bg-tertiary)" }}>
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Teduray</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Filipino</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase" style={{ color: "var(--text-secondary)" }}>English</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {phrases.map(phrase => (
                        <tr key={phrase.id} className="border-t" style={{ borderColor: "var(--border-color)" }}>
                          <td className="px-6 py-4 font-medium" style={{ color: "var(--text-primary)" }}>{phrase.teduray}</td>
                          <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>{phrase.tagalog}</td>
                          <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>{phrase.english}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDeletePhrase(phrase.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>No phrases found. Add your first phrase!</div>
            )}
          </div>
        )}
      </main>

      {/* User Logs Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">Translation Logs</h2>
                <p className="text-sm text-slate-500">{selectedUser.name} ({selectedUser.email})</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
              {selectedUser.translations.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {selectedUser.translations.map((t: any) => (
                    <div key={t.id} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>{t.sourceLanguage} → {t.targetLanguage}</span>
                        <span>{new Date(t.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Source</p>
                          <p className="text-slate-800 dark:text-slate-200 text-sm">{t.sourceText}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Translation</p>
                          <p className="text-indigo-700 dark:text-indigo-300 text-sm">{t.translatedText}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No translations found for this user.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
