import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Pusher from "pusher";
import { connectDB } from "@/config/mongodb";
import { Patient } from "@/models/patient";
import { Doctor } from "@/models/doctor";

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

    if (!socketId || !channelName) {
      return NextResponse.json(
        { success: false, message: "Missing socket_id or channel_name" },
        { status: 400 },
      );
    }

    const patient = await Patient.findOne({ clerkId: userId }).lean();
    const doctor = await Doctor.findOne({ clerkId: userId }).lean();

    let recipientRole: "patient" | "doctor";
    let recipientId: string;

    if (patient) {
      recipientRole = "patient";
      recipientId = String(patient._id);
    } else if (doctor) {
      recipientRole = "doctor";
      recipientId = String(doctor._id);
    } else {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const expectedChannel = `private-${recipientRole}-${recipientId}`;

    if (channelName !== expectedChannel) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const authResponse = pusher.authorizeChannel(socketId, channelName);

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("[POST /api/pusher/auth] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}