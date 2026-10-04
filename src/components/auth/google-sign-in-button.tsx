"use client";

import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";

type GoogleSignInButtonProps = {
  callbackURL?: string;
};

export function GoogleSignInButton({
  callbackURL = "/",
}: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      onClick={() =>
        authClient.signIn.social({
          provider: "google",
          callbackURL,
        })
      }
    >
      <FcGoogle
        className="h-5 w-5 shrink-0"
        aria-hidden="true"
      />

      <span>Continue with Google</span>
    </button>
  );
}