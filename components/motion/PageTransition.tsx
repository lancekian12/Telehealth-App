import type { ReactNode } from "react";

// Fades each page in on navigation. Used from route-group template.tsx
// files, which remount on every route change. Opacity only, so fixed
// children (modals, sheets) keep their viewport positioning.
export default function PageTransition({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
