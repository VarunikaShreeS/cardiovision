"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TriageRoster() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/v1/patients", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setPatients(data.patients || []);
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
        Loading Enterprise Roster...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">❤️</span>
          <h1 className="text-xl font-extrabold text-[#f40632] tracking-tight">
            CardioVision <span className="text-slate-500 font-medium text-lg">Enterprise</span>
          </h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/intake")}
            className="bg-[#f40632] hover:bg-[#d4052c] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            + New Patient Intake Page
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              router.push("/login");
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 mt-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-[#131b2e] flex items-center gap-2">
              📋 Clinical Triage Roster
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Select any patient record to launch their dedicated Multimodal Deep-Dive Assessment page.
            </p>
          </div>
          <div className="bg-slate-200 text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold">
            {patients.length} Active Records
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((p: any) => {
            const isHighRisk = p.risk_tier?.includes("High");
            const isModRisk = p.risk_tier?.includes("Moderate");
            
            // Dynamic styling based on risk level
            const cardBorder = isHighRisk ? "border-red-200 shadow-red-100/50" : "border-slate-200 shadow-slate-200/50";
            const nameColor = isHighRisk ? "text-[#f40632]" : "text-[#131b2e]";
            const badgeBg = isHighRisk ? "bg-red-50 text-[#f40632]" : isModRisk ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600";
            
            // Generate a dynamic avatar color based on the first letter of the name
            const colors = ["bg-orange-500", "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-[#f40632]"];
            const avatarColor = colors[p.name.charCodeAt(0) % colors.length];

            return (
              <div
                key={p.id}
                onClick={() => router.push(`/patient/${p.id}`)}
                className={`bg-white border-2 rounded-3xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200 shadow-lg ${cardBorder}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                      {p.name.substring(0, 2).toUpperCase()}
                    </div>
                    <h3 className={`text-xl font-extrabold ${nameColor}`}>{p.name}</h3>
                  </div>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-md text-xs font-mono font-medium">
                    {p.id}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <p className="text-slate-500 text-sm font-medium">
                    Age: <span className="text-slate-800 font-bold">{p.age}</span>
                  </p>
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeBg}`}>
                    {p.risk_tier}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-2">
                  <p className="text-[#f40632] text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Full Multimodal Analysis <span className="text-lg">→</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}