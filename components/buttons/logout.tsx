"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import ConfirmDialog from "@/components/modal/ConfirmDialog";

export default function Logout() {
  const { signOut } = useClerk();
  const clearPatient = useAuthStore((state) => state.clearPatient);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    clearPatient();
    await signOut({ redirectUrl: "/" });
    window.dispatchEvent(new Event("auth-changed"));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
          <LogOut size={18} />
        </span>
        Logout
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Log out of your account?"
        description="You'll need to sign in again to access your appointments and records."
        confirmLabel="Log out"
        loading={loggingOut}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
