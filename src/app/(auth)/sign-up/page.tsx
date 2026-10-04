"use client";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { IconInput } from "@/components/ui/icon-input";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth-client";
import { Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message ?? "Sign up failed");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <AuthFormShell
      title="Create account"
      description="Set up your account to track sales, inventory, expenses and profits in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link className="underline" href="/sign-in">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <IconInput icon={User} type="text" required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <IconInput icon={Mail} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordInput placeholder="Password" required value={password} onChange={setPassword} />
        <PasswordInput placeholder="Confirm password" required value={confirmPassword} onChange={setConfirmPassword} />

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-3 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-muted" />
        <span className="text-xs text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-muted" />
      </div>

      <GoogleSignInButton />
    </AuthFormShell>
  );
}
