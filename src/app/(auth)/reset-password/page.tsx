"use client";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { PasswordInput } from "@/components/ui/password-input";
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
    <AuthFormShell title="Reset password" description="Choose a new password for your account." footer={<Link className="underline" href="/sign-in">Back to sign in</Link>}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <PasswordInput placeholder="New password" required value={password} onChange={setPassword} />
        <PasswordInput placeholder="Confirm new password" required value={confirmPassword} onChange={setConfirmPassword} />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button disabled={loading} className="btn-primary px-3 disabled:opacity-50">{loading ? "Resetting…" : "Reset password"}</button>
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
