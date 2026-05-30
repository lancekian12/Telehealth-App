"use client";

import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { ReactNode, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

type DbProfile = {
  name?: string;
  image?: string;
  role?: "doctor" | "patient";
};

async function getDbProfile(userId: string): Promise<DbProfile> {
  const [patientResult, doctorResult] = await Promise.allSettled([
    fetch("/api/patient", {
      method: "GET",
      cache: "no-store",
    }).then(async (res) => {
      if (!res.ok) throw new Error("Patient profile not found");
      return res.json();
    }),

    fetch(`/api/doctor/${userId}`, {
      method: "GET",
      cache: "no-store",
    }).then(async (res) => {
      if (!res.ok) throw new Error("Doctor profile not found");
      return res.json();
    }),
  ]);

  if (
    patientResult.status === "fulfilled" &&
    patientResult.value?.success &&
    patientResult.value?.patient
  ) {
    return {
      name: patientResult.value.patient.fullName || "",
      image: patientResult.value.patient.profilePicture || "",
      role: "patient",
    };
  }

  if (
    doctorResult.status === "fulfilled" &&
    doctorResult.value?.success &&
    doctorResult.value?.doctor
  ) {
    return {
      name: doctorResult.value.doctor.fullName || "",
      image: doctorResult.value.doctor.profilePicture || "",
      role: "doctor",
    };
  }

  return {};
}

export default function StreamProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const [client, setClient] = useState<StreamVideoClient | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    let videoClient: StreamVideoClient | null = null;
    let cancelled = false;

    const setupClient = async () => {
      try {
        const dbProfile = await getDbProfile(user.id);

        if (cancelled) return;

        const currentUser = {
          id: user.id,
          name:
            dbProfile.name ||
            user.fullName ||
            user.username ||
            user.firstName ||
            "User",
          image: dbProfile.image || user.imageUrl || "",
        };

        const response = await fetch("/api/stream-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUser.id,
          }),
        });

        const data = await response.json();

        videoClient = new StreamVideoClient({
          apiKey,
          user: currentUser,
          token: data.token,
        });

        if (!cancelled) {
          setClient(videoClient);
        }
      } catch (error) {
        console.error("Failed to setup Stream client:", error);
      }
    };

    void setupClient();

    return () => {
      cancelled = true;
      if (videoClient) {
        videoClient.disconnectUser();
      }
    };
  }, [user, isLoaded]);

  if (!client) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        Loading Video...
      </div>
    );
  }

  return <StreamVideo client={client}>{children}</StreamVideo>;
}