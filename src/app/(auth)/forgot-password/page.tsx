"use client";

import { IconInput } from "@/components/ui/icon-input";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { authClient } from "@/lib/auth-client";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Request failed");
      return;
    }
    setMessage("If an account exists for that email, a reset link has been sent.");
  }

  return (
    <AuthFormShell title="Forgot password" description="Enter the email for your account and we'll send you a secure reset link." footer={<Link className="underline" href="/sign-in">Back to sign in</Link>}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <IconInput icon={Mail} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}
        <button disabled={loading} className="btn-primary px-3 disabled:opacity-50">{loading ? "Sending…" : "Send reset link"}</button>
      </form>
    </AuthFormShell>
  );
}
