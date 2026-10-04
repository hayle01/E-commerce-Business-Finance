"use client";

import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onChangePassword(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Password change failed");
      return;
    }
    setMessage("Password updated.");
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">Account settings</h1>
      <form onSubmit={onChangePassword} className="mt-6 flex flex-col gap-3">
        <h2 className="font-medium">Change password</h2>
        <PasswordInput placeholder="Current password" required value={currentPassword} onChange={setCurrentPassword} />
        <PasswordInput placeholder="New password" required value={newPassword} onChange={setNewPassword} />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {message && <p className="text-sm text-green-700 dark:text-green-400">{message}</p>}
        <button disabled={loading} className="btn-primary px-3 disabled:opacity-50">{loading ? "Updating…" : "Update password"}</button>
      </form>
      <button
        className="btn-secondary mt-8"
        onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { router.push("/sign-in"); router.refresh(); } } })}
      >
        Sign out
      </button>
    </main>
  );
}
