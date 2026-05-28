"use client";

import {
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";

import { ReactNode, useEffect, useState } from "react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export default function StreamProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [client, setClient] =
    useState<StreamVideoClient | null>(null);

  useEffect(() => {
    const setupClient = async () => {
      const user = {
        id: "patient-1",
        name: "Patient",
      };

      const response = await fetch("/api/stream-token", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await response.json();

      const videoClient = new StreamVideoClient({
        apiKey,
        user,
        token: data.token,
      });

      setClient(videoClient);
    };

    setupClient();
  }, []);

  if (!client) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading Video...
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      {children}
    </StreamVideo>
  );
}