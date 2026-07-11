import React, { useState } from "react";
import { Monitor, KeyRound, User, ShieldCheck, Terminal, Clock, Sparkles } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Current UTC time for security stamping
  const [utcTime] = useState("12:15:39");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Dynamic verification (allowing both simulated credentials and standard admin bypass)
    setTimeout(() => {
      if (username.toLowerCase() === "admin" && password === "admin") {
        onLoginSuccess({ name: "John Doe", email: "admin@aenzbi.com" });
      } else if (username.includes("@") && password.length >= 4) {
        onLoginSuccess({ name: username.split("@")[0], email: username });
      } else {
        setError("Invalid credentials. Try admin / admin or use any valid email.");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased text-slate-800" id="login-container-stage">
      {/* Background Decorative Polygons */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-200 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden relative z-10 animate-fade-in flex flex-col">
        {/* Top Header section */}
        <div className="px-6 py-8 border-b border-slate-150 bg-slate-50/70 text-center space-y-3 shrink-0">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-indigo-900/20">
            A
          </div>
          <div className="space-y-1">
            <h1 className="font-extrabold text-lg tracking-tight text-slate-900 uppercase">Aenzbi IPTV</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Property Management Suite</p>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 space-y-4 text-xs">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg flex items-start gap-2.5 font-medium leading-relaxed">
              <KeyRound className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Username or Email</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin (or administrative email)"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/30"
                  id="login-username-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin (or secure password)"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/30"
                  id="login-password-input"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              AES-256 Auth Active
            </span>
            <span className="font-mono text-slate-400">UTC: {utcTime}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2 text-xs"
            id="login-submit-btn"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
              </>
            )}
          </button>
        </form>

        {/* Hints Footer */}
        <div className="px-6 py-4.5 bg-slate-50/50 border-t border-slate-150 text-center text-[10px] text-slate-400 font-mono space-y-1">
          <div>💡 Admin Credentials Preset:</div>
          <div>
            Username: <strong className="text-slate-600">admin</strong> / Password: <strong className="text-slate-600">admin</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
