"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function IntakePage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    blood_pressure: "",
    cholesterol: "",
    troponin_i: "",
    clinical_notes: "",
    risk_tier: "Low Risk",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const token = localStorage.getItem("token");

    // Generate a random ID like CV-4829
    const generatedId = `CV-${Math.floor(1000 + Math.random() * 9000)}`;

    const payload = {
      id: generatedId, // <-- Added this to satisfy FastAPI!
      name: formData.name,
      age: parseInt(formData.age, 10),
      blood_pressure: formData.blood_pressure,
      cholesterol: parseFloat(formData.cholesterol),
      troponin_i: parseFloat(formData.troponin_i),
      risk_tier: formData.risk_tier,
      clinical_notes: formData.clinical_notes,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let errorMessage = "Failed to add patient record.";
        if (data && data.detail) {
          if (Array.isArray(data.detail)) {
             errorMessage = data.detail.map((err: any) => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(" | ");
          } else {
             errorMessage = data.detail;
          }
        }
        throw new Error(errorMessage);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-[#131b2e] font-bold">
        Verifying Secure Session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200">
          <button 
            onClick={() => router.push("/")} 
            className="text-[#f40632] hover:text-[#d4052c] text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 transition-colors"
          >
            ← Cancel & Return to Roster
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📝</span>
            <div>
              <h1 className="text-2xl font-extrabold text-[#131b2e] tracking-tight">New Patient Intake</h1>
              <p className="text-slate-500 text-sm font-medium mt-1">Enter clinical vitals to generate a new multimodal assessment.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-lg border border-slate-200">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold break-words">{error}</div>}
          {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-sm font-bold flex items-center gap-2">✅ Patient successfully added! Redirecting...</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#131b2e] mb-2">Patient Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Jane Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#f40632] focus:ring-1 focus:ring-[#f40632] transition-all text-sm" />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#131b2e] mb-2">Age</label>
                <input required type="number" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 58" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#f40632] focus:ring-1 focus:ring-[#f40632] transition-all text-sm" />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#131b2e] mb-2">Blood Pressure</label>
                <input required type="text" name="blood_pressure" value={formData.blood_pressure} onChange={handleChange} placeholder="e.g. 120/80" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#f40632] focus:ring-1 focus:ring-[#f40632] transition-all text-sm" />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#131b2e] mb-2">Cholesterol (mg/dL)</label>
                <input required type="number" step="any" name="cholesterol" value={formData.cholesterol} onChange={handleChange} placeholder="e.g. 195" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#f40632] focus:ring-1 focus:ring-[#f40632] transition-all text-sm" />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#131b2e] mb-2">Troponin I (ng/mL)</label>
                <input required type="number" step="any" name="troponin_i" value={formData.troponin_i} onChange={handleChange} placeholder="e.g. 0.02" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#f40632] focus:ring-1 focus:ring-[#f40632] transition-all text-sm" />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#131b2e] mb-2">Manual Triage Tier</label>
                <select name="risk_tier" value={formData.risk_tier} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#f40632] focus:ring-1 focus:ring-[#f40632] transition-all text-sm">
                  <option value="Low Risk">Low Risk</option>
                  <option value="Moderate Risk">Moderate Risk</option>
                  <option value="High Risk">High Risk</option>
                </select>
              </div>

            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#131b2e] mb-2">Clinical Observations</label>
              <textarea required name="clinical_notes" value={formData.clinical_notes} onChange={handleChange} placeholder="Enter presenting symptoms, history, etc..." rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#f40632] focus:ring-1 focus:ring-[#f40632] transition-all text-sm resize-none"></textarea>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-[#131b2e] hover:bg-[#1a253f] text-white font-bold py-4 rounded-xl transition-all shadow-md text-sm disabled:opacity-50 mt-4"
            >
              {loading ? "Saving Record..." : success ? "Record Saved!" : "Submit Patient Record"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}