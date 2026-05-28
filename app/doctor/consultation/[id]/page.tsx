import StreamProvider from "@/components/providers/stream-provider";
import ConsultationClient from "./consultation-client";

export default function Page() {
  return (
    <StreamProvider>
      <ConsultationClient />
    </StreamProvider>
  );
}