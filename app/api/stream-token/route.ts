import { NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const secret = process.env.STREAM_SECRET_KEY!;

const client = new StreamClient(apiKey, secret);

export async function POST(req: Request) {
  const body = await req.json();

  const userId = body.userId;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const token = client.generateUserToken({
    user_id: userId,
  });

  return NextResponse.json({ token });
}
