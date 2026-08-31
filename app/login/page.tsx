"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { resolveRoleAndRedirect } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError(signInError?.message ?? "Sign in failed. Check your details.");
      setLoading(false);
      return;
    }

    const { redirectTo } = await resolveRoleAndRedirect(data.user.email!);
    router.push(redirectTo);
  }

  async function handleOAuth(provider: "apple" | "google") {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <main className="app-shell flex min-h-dvh flex-col justify-center gap-6 px-5 py-8">
      <div className="text-center">
        <div className="text-lg font-bold tracking-tight">GymFlex</div>
        <h1 className="mt-4 text-2xl font-extrabold">Welcome back 👋</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-medium text-neutral-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-btn border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-[#4ade80]"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-medium text-neutral-400">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-btn border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-[#4ade80]"
            placeholder="••••••••"
          />
        </div>

        {error && <div className="text-xs text-red-400">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-btn bg-[#4ade80] px-4 py-3.5 text-center text-sm font-bold text-black disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in →"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] text-neutral-500">or continue with</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleOAuth("apple")}
          className="flex items-center justify-center gap-2 rounded-btn border border-border bg-surface px-4 py-3 text-sm font-medium"
        >
          <span aria-hidden></span>
          Continue with Apple
        </button>
        <button
          onClick={() => handleOAuth("google")}
          className="flex items-center justify-center gap-2 rounded-btn border border-border bg-surface px-4 py-3 text-sm font-medium"
        >
          <span aria-hidden>G</span>
          Continue with Google
        </button>
      </div>

      <p className="text-center text-xs text-neutral-500">
        New member? Your gym will send you an invite link.
      </p>
    </main>
  );
}
