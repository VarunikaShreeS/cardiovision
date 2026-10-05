"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PatientAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id;

  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/patients")
      .then((res) => res.json())
      .then(async (data) => {
        const found = data.patients.find((p: any) => p.id === patientId) || data.patients[0];

        const payload = {
          patient_id: found.id,
          vitals: {
            age: found.age,
            blood_pressure: found.risk_tier === "High Risk" ? 155 : 120,
            cholesterol: found.risk_tier === "High Risk" ? 280 : 190,
            troponin_i: found.risk_tier === "High Risk" ? 0.45 : 0.02,
            heart_rate: 88
          },
          clinical_notes: found.risk_tier === "High Risk" 
            ? "Patient reports severe exertional chest pain radiating to the left arm." 
            : "Routine checkup. No acute distress reported.",
          ecg_waveform_id: `ECG-${found.id}`
        };

        const res = await fetch("http://127.0.0.1:8000/api/v1/predict/multimodal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        setAnalysis({ ...result, patientName: found.name, patientAge: found.age });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center text-slate-600">
        <div className="animate-spin text-5xl mb-4">⚙️</div>
        <h2 className="text-xl font-bold text-rose-600 animate-pulse">Running Multimodal Fusion Engine...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <button onClick={() => router.push("/")} className="text-xs font-bold text-rose-600 hover:underline mb-1 block">
              ← Back to Triage Roster
            </button>
            <h1 className="text-3xl font-black text-slate-800">
              {analysis.patientName} <span className="text-slate-400 font-light text-lg ml-2">ID: {patientId}</span>
            </h1>
          </div>
          <button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl shadow transition">
            📄 Export Clinical PDF Report
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col justify-center shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">🤖 AI Clinical Synthesis</h3>
            <p className="text-slate-700 font-medium leading-relaxed text-base">{analysis.ai_clinical_summary}</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl flex flex-col justify-center items-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Fusion CAD Risk Score</span>
            <span className="text-6xl font-black">{analysis.fusion_cad_probability}%</span>
            <span className="text-sm font-semibold mt-2 text-rose-400">{analysis.risk_level}</span>
          </div>
        </div>
      </div>
    </div>
  );
}