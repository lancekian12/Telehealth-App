"use client";

import { useClerk } from "@clerk/nextjs";

export default function Navbar() {
  const { signOut } = useClerk();

  return (
    <button onClick={() => signOut({ redirectUrl: "/" })}>
      Log out
    </button>
  );
}