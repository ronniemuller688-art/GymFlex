"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { resolveRoleAndRedirect } from "@/lib/session";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user?.email) return;
      const { redirectTo } = await resolveRoleAndRedirect(session.user.email);
      router.replace(redirectTo);
    });

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user?.email) {
        const { redirectTo } = await resolveRoleAndRedirect(data.session.user.email);
        router.replace(redirectTo);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <main className="app-shell flex min-h-dvh flex-col items-center justify-center gap-3 px-5">
      <div className="text-sm text-neutral-400">Signing you in…</div>
    </main>
  );
}
