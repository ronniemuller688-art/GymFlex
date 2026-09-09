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
          <svg
            aria-hidden
            viewBox="0 0 384 512"
            className="h-4 w-4 shrink-0 fill-white"
          >
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
          </svg>
          Continue with Apple
        </button>
        <button
          onClick={() => handleOAuth("google")}
          className="flex items-center justify-center gap-2 rounded-btn border border-border bg-surface px-4 py-3 text-sm font-medium"
        >
          <svg aria-hidden viewBox="0 0 48 48" className="h-4 w-4 shrink-0">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.4 0-13.8 4.1-17.1 10.1z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.5 34.8 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.9 39.8 16.4 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C39.5 37.5 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z"
            />
          </svg>
          Continue with Google
        </button>
      </div>

      <p className="text-center text-xs text-neutral-500">
        New member? Your gym will send you an invite link.
      </p>
    </main>
  );
}
