"use client";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!token) {
      setError("Missing reset token");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Reset failed");
      return;
    }
    router.push("/sign-in");
  }

  return (
    <AuthFormShell title="Reset password" footer={<Link className="underline" href="/sign-in">Back to sign in</Link>}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="rounded-md border border-neutral-300 px-3 py-2" type="password" required placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input className="rounded-md border border-neutral-300 px-3 py-2" type="password" required placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="rounded-md bg-neutral-900 px-3 py-2 text-white disabled:opacity-50">{loading ? "Resetting…" : "Reset password"}</button>
      </form>
    </AuthFormShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
