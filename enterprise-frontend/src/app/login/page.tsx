"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid credentials");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("full_name", data.full_name);

      if (data.role === "cardiologist") {
        router.push("/");
      } else {
        router.push("/patient/CV-8942");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center p-6">
      <div className="bg-white max-w-md w-full rounded-[32px] p-10 shadow-2xl text-slate-900 relative">
        <div className="text-center mb-8">
          <div className="inline-block text-4xl mb-3 animate-pulse">❤️</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#131b2e]">CardioVision</h1>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">Secure Enterprise Authentication</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
              Username / Clinical ID
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. doctor or patient"
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#f40632] focus:ring-1 focus:ring-[#f40632] transition-all text-sm"
            />
            <p className="text-[11px] text-slate-500 mt-1">Default accounts: "doctor" or "patient"</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
              Secure Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#f40632] focus:ring-1 focus:ring-[#f40632] transition-all text-sm"
            />
            <p className="text-[11px] text-slate-500 mt-1">Default passwords: "securepassword123" / "patient123"</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f40632] hover:bg-[#d4052c] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-500/20 text-sm disabled:opacity-50 mt-2"
          >
            {loading ? "Verifying Credentials..." : "Sign In to Portal"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-mono tracking-wide">
            System v3.3 • HIPAA Compliant Environment
          </p>
        </div>
      </div>
    </div>
  );
}