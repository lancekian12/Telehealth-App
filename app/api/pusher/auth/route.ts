import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Pusher from "pusher";
import { connectDB } from "@/config/mongodb";
import { Patient } from "@/models/patient";

export const runtime = "nodejs";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: Request) {
  try {
    await connectDB();

    const { userId } = await auth();
    console.log("[POST /api/pusher/auth] clerk userId:", userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.text();
    const params = new URLSearchParams(body);

    const socketId = params.get("socket_id") || "";
    const channelName = params.get("channel_name") || "";

    console.log("[POST /api/pusher/auth] socketId:", socketId);
    console.log("[POST /api/pusher/auth] channelName:", channelName);

    if (!socketId || !channelName) {
      return NextResponse.json(
        { success: false, message: "Missing socket_id or channel_name" },
        { status: 400 },
      );
    }

    const patient = await Patient.findOne({ clerkId: userId }).lean();
    console.log("[POST /api/pusher/auth] patientId:", patient?._id);

    if (!patient) {
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 },
      );
    }

    const expectedChannel = `private-patient-${patient._id}`;
    console.log("[POST /api/pusher/auth] expectedChannel:", expectedChannel);

    if (channelName !== expectedChannel) {
      console.log("[POST /api/pusher/auth] forbidden channel mismatch");
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const authResponse = pusher.authorizeChannel(socketId, channelName);
    console.log("[POST /api/pusher/auth] authorized");

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("[POST /api/pusher/auth] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}