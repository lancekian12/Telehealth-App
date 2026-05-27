"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export default function Logout() {
  const { signOut } = useClerk();
  const clearPatient = useAuthStore((state) => state.clearPatient);

  const handleLogout = async () => {
    clearPatient();
    await signOut({ redirectUrl: "/" });
    window.dispatchEvent(new Event("auth-changed"));
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
        <LogOut size={18} />
      </span>
      Logout
    </button>
  );
}