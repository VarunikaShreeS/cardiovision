"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [patients, setPatients] = useState([]);

  // Fetch the mock patient roster from our FastAPI backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data.patients))
      .catch((err) => console.error("Error fetching API:", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-8 shadow-sm flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">❤️</span>
          <h1 className="text-2xl font-black text-rose-600 tracking-tight">
            CardioVision <span className="text-slate-700 font-light text-lg">Enterprise</span>
          </h1>
        </div>
        <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full">
          v3.0 - Multimodal Engine
        </span>
      </header>

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Patient Roster (Pillar 1) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-slate-700 border-b pb-2">📋 Patient Roster</h2>
          
          <div className="space-y-3">
            {patients.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Connecting to FastAPI...</p>
            ) : (
              patients.map((p: any) => (
                <div key={p.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md cursor-pointer transition bg-slate-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">{p.name}</span>
                    <span className="text-xs font-mono text-slate-500">{p.id}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-500">Age: {p.age}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      p.risk_tier === "High Risk" ? "bg-red-100 text-red-700" :
                      p.risk_tier === "Moderate Risk" ? "bg-amber-100 text-amber-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>
                      {p.risk_tier}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Placeholder for Multimodal Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col justify-center items-center text-slate-400">
            <span className="text-4xl mb-4">🩺</span>
            <h3 className="text-xl font-bold text-slate-600">Patient Profile Viewer</h3>
            <p className="text-sm mt-2 max-w-md text-center">
              Select a patient from the roster to view their Multimodal AI assessment (Vitals, ECG, and Clinical Notes).
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}