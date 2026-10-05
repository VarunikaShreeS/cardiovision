"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState<string | null>(null);

  const handleLogin = (role: "doctor" | "patient") => {
    setIsAuthenticating(role);
    
    setTimeout(() => {
      if (role === "doctor") {
        localStorage.setItem("userRole", "cardiologist");
        router.push("/"); // Doctors go to the master roster
      } else {
        localStorage.setItem("userRole", "patient");
        router.push("/patient/CV-8942"); // Patients go strictly to their own record (using John Doe's ID as a demo)
      }
    }, 1200); // Fake a secure network delay for the demo
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center font-sans p-4 relative overflow-hidden">
      {/* Background medical grid styling */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

      <div className="z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-slate-200">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <span className="text-4xl">❤️</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            CardioVision
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Secure Enterprise Authentication</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleLogin("doctor")}
            disabled={isAuthenticating !== null}
            className="w-full flex items-center justify-between bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all group disabled:opacity-70"
          >
            <span className="flex items-center space-x-3">
              <span className="text-xl">🩺</span>
              <span>Login as Cardiologist</span>
            </span>
            {isAuthenticating === "doctor" ? (
              <span className="animate-spin">⚙️</span>
            ) : (
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            )}
          </button>

          <button
            onClick={() => handleLogin("patient")}
            disabled={isAuthenticating !== null}
            className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all group disabled:opacity-70"
          >
            <span className="flex items-center space-x-3">
              <span className="text-xl">👤</span>
              <span>Patient Portal Access</span>
            </span>
            {isAuthenticating === "patient" ? (
              <span className="animate-spin">⚙️</span>
            ) : (
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-mono">
            System v3.2 • HIPAA Compliant Environment
          </p>
        </div>
      </div>
    </div>
  );
}