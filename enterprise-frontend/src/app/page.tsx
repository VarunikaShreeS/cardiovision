"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    // SECURITY GUARD: Check authentication before loading
    const role = localStorage.getItem("userRole");
    if (!role) {
      router.push("/login");
      return;
    }
    if (role === "patient") {
      router.push("/patient/CV-8942"); // Patients cannot see the roster
      return;
    }

    // Fetch patients if authentication passes
    fetch("http://127.0.0.1:8000/api/v1/patients")
      .then((res) => res.json())
      .then((data) => {
        const customPatients = JSON.parse(localStorage.getItem("customPatients") || "[]");
        setPatients([...customPatients, ...data.patients]);
      })
      .catch((err) => console.error("Error:", err));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 py-4 px-8 shadow-sm flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">❤️</span>
          <h1 className="text-2xl font-black text-rose-600 tracking-tight">
            CardioVision <span className="text-slate-700 font-light text-lg">Enterprise</span>
          </h1>
        </div>
        <div className="flex space-x-4 items-center">
          <button 
            onClick={() => router.push("/intake")}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition"
          >
            + New Patient Intake Page
          </button>
          <button 
            onClick={handleLogout}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">📋 Clinical Triage Roster</h2>
            <p className="text-sm text-slate-500">Select any patient record to launch their dedicated Multimodal Deep-Dive Assessment page.</p>
          </div>
          <span className="text-xs bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded-full">{patients.length} Active Records</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((p: any) => (
            <div 
              key={p.id} 
              onClick={() => router.push(`/patient/${p.id}`)}
              className="bg-white p-6 border border-slate-200 rounded-2xl hover:shadow-lg hover:border-rose-300 cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={p.photo || `https://ui-avatars.com/api/?name=${p.name}&background=random`} 
                    alt={p.name} 
                    className="w-10 h-10 rounded-full border border-slate-200 object-cover shadow-sm"
                  />
                  <span className="font-bold text-lg text-slate-800 group-hover:text-rose-600 transition">{p.name}</span>
                </div>
                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{p.id}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
                <span>Age: <strong className="text-slate-700">{p.age}</strong></span>
                <span className={`text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${
                  p.risk_tier === "High Risk" ? "bg-red-100 text-red-700" :
                  p.risk_tier === "Moderate Risk" ? "bg-amber-100 text-amber-700" :
                  "bg-emerald-100 text-emerald-700"
                }`}>
                  {p.risk_tier}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-rose-600 font-bold">
                <span>View Full Multimodal Analysis →</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}