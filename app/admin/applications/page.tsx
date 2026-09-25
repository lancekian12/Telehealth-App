import { Suspense } from "react";
import AdminApplicationsClient from "./AdminApplicationsClient";

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={null}>
      <AdminApplicationsClient />
    </Suspense>
  );
}
