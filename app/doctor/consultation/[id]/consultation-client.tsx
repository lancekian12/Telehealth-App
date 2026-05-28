"use client";

import {
  CallControls,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";

import { useEffect, useState } from "react";
import { Call } from "@stream-io/video-client";
import { useRouter } from "next/navigation";
import { FileText, X, ChevronRight, ChevronLeft } from "lucide-react";

export default function ConsultationClient() {
  const client = useStreamVideoClient();
  const router = useRouter();

  const [call, setCall] = useState<Call | null>(null);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(true);

  const [prescription, setPrescription] = useState({
    diagnosis: "",
    medication: "",
    dosage: "",
    instructions: "",
    notes: "",
  });

  useEffect(() => {
    if (!client) return;

    let activeCall: Call;

    const setupCall = async () => {
      const myCall = client.call("default", "appointment-room-1");
      activeCall = myCall;

      await myCall.join({ create: true });

      try {
        await myCall.microphone.enable();
        await myCall.camera.enable();
      } catch (error) {
        console.log("Camera not available:", error);
      }

      setCall(myCall);
    };

    setupCall();

    return () => {
      activeCall?.leave();
    };
  }, [client]);

  const handleChange =
    (field: keyof typeof prescription) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setPrescription((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSavePrescription = () => {
    console.log("Prescription data:", prescription);
    alert("Prescription saved locally. Connect this to your backend to store it.");
  };

  if (!call) return null;

  return (
    <StreamCall call={call}>
      <StreamTheme>
        <div className="relative h-screen bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 p-3 sm:p-4 pr-3 sm:pr-[370px]">
            <div className="h-full rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
              <SpeakerLayout />
            </div>
          </div>

          <button
            onClick={() => setIsPrescriptionOpen((prev) => !prev)}
            className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/95 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur hover:bg-zinc-800 transition"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Prescription</span>
            {isPrescriptionOpen ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          <div
            className={`fixed right-4 top-16 z-40 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-zinc-800 bg-zinc-900/95 shadow-2xl backdrop-blur transition-all duration-300 ${
              isPrescriptionOpen
                ? "translate-x-0 opacity-100"
                : "translate-x-[110%] opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">Prescription</h2>
                <p className="text-[11px] text-zinc-400">
                  Quick notes for the patient
                </p>
              </div>

              <button
                onClick={() => setIsPrescriptionOpen(false)}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                aria-label="Close prescription panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(100vh-140px)] overflow-y-auto p-4 space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-zinc-300">
                  Diagnosis
                </label>
                <input
                  type="text"
                  value={prescription.diagnosis}
                  onChange={handleChange("diagnosis")}
                  placeholder="e.g. Mild fever"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-white/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-zinc-300">
                  Medication
                </label>
                <input
                  type="text"
                  value={prescription.medication}
                  onChange={handleChange("medication")}
                  placeholder="e.g. Paracetamol"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-white/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-zinc-300">
                  Dosage
                </label>
                <input
                  type="text"
                  value={prescription.dosage}
                  onChange={handleChange("dosage")}
                  placeholder="e.g. 500mg, 1 tablet"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-white/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-zinc-300">
                  Instructions
                </label>
                <textarea
                  value={prescription.instructions}
                  onChange={handleChange("instructions")}
                  placeholder="e.g. Take after meals, twice a day"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-white/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-zinc-300">
                  Notes
                </label>
                <textarea
                  value={prescription.notes}
                  onChange={handleChange("notes")}
                  placeholder="Extra reminders"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-white/40"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSavePrescription}
                  className="flex-1 rounded-xl bg-white px-3 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition"
                >
                  Save
                </button>

                <button
                  onClick={() =>
                    setPrescription({
                      diagnosis: "",
                      medication: "",
                      dosage: "",
                      instructions: "",
                      notes: "",
                    })
                  }
                  className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950/95 p-3 sm:p-4">
            <CallControls
              onLeave={async () => {
                await call.leave();
                router.push("/doctor/home");
              }}
            />
          </div>
        </div>
      </StreamTheme>
    </StreamCall>
  );
}