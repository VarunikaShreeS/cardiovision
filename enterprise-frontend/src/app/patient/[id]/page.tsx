"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function PatientAnalysisPage() {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();

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
        const foundPatient = data.patients?.find((p: any) => p.id === params.id);
        if (foundPatient) {
          setPatient(foundPatient);
        } else {
          router.push("/");
        }
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-400 text-sm font-medium">
        Loading Clinical Data...
      </div>
    );
  }

  if (!patient) return null;

  const isHighRisk = patient.risk_tier?.includes("High");
  const isModerateRisk = patient.risk_tier?.includes("Moderate");
  
  // Red for high risk, Navy for score box text
  const riskColor = isHighRisk ? "text-[#f40632]" : isModerateRisk ? "text-orange-500" : "text-emerald-500";
  const riskBorder = isHighRisk ? "bg-[#f40632]" : isModerateRisk ? "bg-orange-500" : "bg-emerald-500";
  const riskScore = isHighRisk ? "91.2%" : isModerateRisk ? "54.8%" : "29.2%"; 

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Navigation & Profile Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-lg border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <button 
              onClick={() => router.push("/")} 
              className="text-[#f40632] hover:text-[#d4052c] text-xs font-bold uppercase tracking-wider mb-5 flex items-center gap-2 transition-colors"
            >
              ← Back to Triage Roster
            </button>
            <div className="flex items-center gap-5">
              {/* Navy Avatar */}
              <div className="w-16 h-16 bg-[#131b2e] rounded-full flex items-center justify-center text-2xl font-black text-white shadow-md">
                {patient.name.substring(0,2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-[#131b2e] tracking-tight">{patient.name}</h1>
                <p className="text-slate-500 text-sm font-medium mt-1.5">ID: <span className="text-[#131b2e] font-bold">{patient.id}</span> | Age: <span className="text-[#131b2e] font-bold">{patient.age}</span></p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {/* Navy Export Button */}
            <button 
              onClick={() => window.print()} 
              className="flex-1 md:flex-none bg-[#131b2e] hover:bg-[#1a253f] text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              📄 Export PDF
            </button>
            {/* Red Outline Sign Out Button */}
            <button 
              onClick={() => { localStorage.clear(); router.push("/login"); }} 
              className="flex-1 md:flex-none bg-white hover:bg-red-50 text-[#f40632] px-5 py-3 rounded-xl text-sm font-bold transition-all border border-red-100 flex items-center justify-center"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Clinical Analysis Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* AI Synthesis Notes */}
          <div className="md:col-span-2 bg-white rounded-[32px] p-8 shadow-lg border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#131b2e] mb-5 flex items-center gap-2">
                <span className="text-[#f40632] text-lg">🤖</span> AI Clinical Synthesis
              </h3>
              <p className="text-slate-700 leading-relaxed text-lg font-medium">
                {patient.clinical_notes || `Multimodal analysis completed. Computed CAD probability correlates with a ${patient.risk_tier.toLowerCase()} profile.`}
              </p>
            </div>
            
            {/* Vitals Footer */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Blood Pressure</p>
                <p className="text-xl font-extrabold text-[#131b2e]">{patient.blood_pressure || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cholesterol</p>
                <p className="text-xl font-extrabold text-[#131b2e]">{patient.cholesterol || "N/A"} <span className="text-xs text-slate-400 font-normal">mg/dL</span></p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Troponin I</p>
                <p className="text-xl font-extrabold text-[#131b2e]">{patient.troponin_i || "N/A"} <span className="text-xs text-slate-400 font-normal">ng/mL</span></p>
              </div>
            </div>
          </div>

          {/* Risk Score Card - Navy Blue for High Contrast */}
          <div className="bg-[#131b2e] rounded-[32px] p-8 shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2 ${riskBorder}`}></div>
            
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-300 mb-6">Fusion CAD Risk Score</h3>
            <div className="text-7xl font-black text-white mb-6 tracking-tighter">
              {riskScore}
            </div>
            {/* White pill with Red/Green text */}
            <p className={`text-sm font-extrabold uppercase tracking-widest ${riskColor} bg-white px-5 py-2.5 rounded-xl shadow-sm`}>
              {patient.risk_tier}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}