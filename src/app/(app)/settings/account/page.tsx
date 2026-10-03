"use client";

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
        <input className="rounded-md border border-neutral-300 px-3 py-2" type="password" required placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <input className="rounded-md border border-neutral-300 px-3 py-2" type="password" required placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}
        <button disabled={loading} className="rounded-md bg-neutral-900 px-3 py-2 text-white disabled:opacity-50">{loading ? "Updating…" : "Update password"}</button>
      </form>
      <button
        className="mt-8 rounded-md border border-neutral-300 px-3 py-2"
        onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { router.push("/sign-in"); router.refresh(); } } })}
      >
        Sign out
      </button>
    </main>
  );
}
