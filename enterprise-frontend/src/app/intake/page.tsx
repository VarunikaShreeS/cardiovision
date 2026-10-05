"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IntakePage() {
  const router = useRouter();
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formBP, setFormBP] = useState("");
  const [formChol, setFormChol] = useState("");
  const [formTrop, setFormTrop] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // SECURITY GUARD: Only cardiologists can access intake
    const role = localStorage.getItem("userRole");
    if (role !== "cardiologist") {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formAge) return;

    setIsSubmitting(true);

    const newPatient = {
      id: `CV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formName,
      age: Number(formAge),
      blood_pressure: Number(formBP) || 120,
      cholesterol: Number(formChol) || 200,
      troponin_i: Number(formTrop) || 0.03,
      risk_tier: (Number(formTrop) > 0.1 || Number(formBP) > 140) ? "High Risk" : "Moderate Risk",
      clinical_notes: formNotes || "Standard intake record."
    };

    const existingPatients = JSON.parse(localStorage.getItem("customPatients") || "[]");
    localStorage.setItem("customPatients", JSON.stringify([newPatient, ...existingPatients]));
    
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800">🏥 Clinical Patient Intake</h1>
            <p className="text-sm text-slate-500 mt-1">Register a new patient into the CardioVision Multimodal Triage pipeline.</p>
          </div>
          <button 
            onClick={() => router.push("/")}
            className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg transition"
          >
            ← Back to Roster
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Patient Full Name</label>
              <input 
                type="text" required placeholder="e.g. Dr. Eleanor Vance" 
                value={formName} onChange={(e) => setFormName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Age</label>
              <input 
                type="number" required placeholder="e.g. 58" 
                value={formAge} onChange={(e) => setFormAge(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Blood Pressure</label>
              <input 
                type="number" placeholder="120" value={formBP} onChange={(e) => setFormBP(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Cholesterol</label>
              <input 
                type="number" placeholder="200" value={formChol} onChange={(e) => setFormChol(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Troponin-I</label>
              <input 
                type="number" step="0.01" placeholder="0.03" value={formTrop} onChange={(e) => setFormTrop(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Clinical Notes (EHR Text)</label>
            <textarea 
              rows={4} placeholder="Enter patient symptoms or physician remarks..."
              value={formNotes} onChange={(e) => setFormNotes(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button 
              type="button" onClick={() => router.push("/")}
              className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow transition"
            >
              {isSubmitting ? "Processing..." : "Complete Registration & Run AI 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}