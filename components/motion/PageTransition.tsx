import type { ReactNode } from "react";

// Fades and lifts each page in on navigation. Used from route-group
// template.tsx files, which remount on every route change. The animation
// fill mode is "backwards", so no transform lingers to break fixed modals.
export default function PageTransition({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
