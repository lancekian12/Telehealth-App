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
import { useParams, useRouter, useSearchParams } from "next/navigation";

type Props = {
  currentUserRole?: "doctor" | "patient";
  currentUserId?: string;
  currentUserName?: string;
};

export default function ConsultationClient({ currentUserRole }: Props) {
  const client = useStreamVideoClient();
  const router = useRouter();
  const params = useParams<{ appointmentId: string }>();
  const searchParams = useSearchParams();

  const appointmentId = params?.appointmentId;
  const roomId = appointmentId ? `consultation-${appointmentId}` : "";

  const roleFromQuery = searchParams.get("role");
  const resolvedRole: "doctor" | "patient" =
    currentUserRole ?? (roleFromQuery === "doctor" ? "doctor" : "patient");

  const isDoctor = resolvedRole === "doctor";

  const [call, setCall] = useState<Call | null>(null);
  const [isLoadingCall, setIsLoadingCall] = useState(true);

  useEffect(() => {
    if (!client || !roomId) return;

    let isMounted = true;
    let activeCall: Call | null = null;

    const setupCall = async () => {
      try {
        const newCall = client.call("default", roomId);
        activeCall = newCall;

        await newCall.join({ create: true });

        if (!isMounted) {
          await newCall.leave();
          return;
        }

        setCall(newCall);
      } catch (error) {
        console.error("Failed to join call:", error);
        setCall(null);
      } finally {
        if (isMounted) setIsLoadingCall(false);
      }
    };

    void setupCall();

    return () => {
      isMounted = false;
      if (activeCall) {
        void activeCall.leave();
      }
    };
  }, [client, roomId]);

  if (isLoadingCall && !call) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-4 text-sm text-zinc-300">
          Joining consultation...
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-4 text-sm text-zinc-300">
          Unable to open consultation room.
        </div>
      </div>
    );
  }

  return (
    <StreamCall call={call}>
      <StreamTheme>
        <div className="relative h-screen overflow-hidden bg-zinc-950 text-white">
          <div className="absolute inset-0 p-3 sm:p-4">
            <div
              className={`h-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40`}
            >
              <SpeakerLayout />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950/95 p-3 sm:p-4">
            <CallControls
              onLeave={() => {
                void (async () => {
                  if (isDoctor) {
                    router.replace(
                      appointmentId
                        ? `/doctor/prescription?appointmentId=${appointmentId}`
                        : "/doctor/prescription",
                    );
                  } else {
                    router.replace("/appointments");
                  }
                })();
              }}
            />
          </div>
        </div>
      </StreamTheme>
    </StreamCall>
  );
}