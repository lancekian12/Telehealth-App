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

export default function ConsultationClient() {
  const client = useStreamVideoClient();

  const router = useRouter();

  const [call, setCall] = useState<Call | null>(null);

  useEffect(() => {
    if (!client) return;

    const setupCall = async () => {
      const myCall = client.call(
        "default",
        "appointment-room-1"
      );

      await myCall.join({ create: true });

      try {
        // microphone only
        await myCall.microphone.enable();

        // OPTIONAL CAMERA
        // if device has no camera this won't crash
        await myCall.camera.enable();
      } catch (error) {
        console.log("Camera not available:", error);
      }

      setCall(myCall);
    };

    setupCall();

    return () => {
      call?.leave();
    };
  }, [client]);

  if (!call) return null;

  return (
    <StreamCall call={call}>
      <StreamTheme>
        <div className="h-screen bg-zinc-950 flex flex-col">
          <div className="flex-1 p-4">
            <SpeakerLayout />
          </div>

          <div className="p-4 border-t border-zinc-800">
            <CallControls
              onLeave={() => {
                router.push("/doctor/home");
              }}
            />
          </div>
        </div>
      </StreamTheme>
    </StreamCall>
  );
}