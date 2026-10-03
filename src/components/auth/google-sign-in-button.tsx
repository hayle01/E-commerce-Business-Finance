"use client";

import { authClient } from "@/lib/auth-client";

export function GoogleSignInButton() {
  return (
    <button
      type="button"
      className="w-full rounded-md border border-neutral-300 px-3 py-2"
      onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/" })}
    >
      Continue with Google
    </button>
  );
}
