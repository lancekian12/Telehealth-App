import type { DisplayStatus } from "@/config/appointmentStatus";

export function statusBadgeClass(status: DisplayStatus) {
  switch (status) {
    case "accepted":
      return "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary";
    case "ongoing":
      return "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300";
    case "pending":
      return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300";
    case "completed":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300";
    case "rejected":
      return "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300";
    case "unattended":
      return "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
}
