import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side / anon-key client. Stores the session in cookies (not
// localStorage) via @supabase/ssr so middleware can read it on the server —
// that's what lets protected routes redirect before any page renders,
// instead of flashing the page and then bouncing to /login.
//
// Built lazily behind a Proxy instead of at module scope: Next.js still
// evaluates "use client" page modules once during build-time static
// prerendering, and createBrowserClient() throws immediately if the env
// vars aren't set at that point (e.g. before they're added in Vercel).
// Every real call site touches `supabase.auth...`/`supabase.from...` from
// inside a useEffect or event handler, so deferring construction to first
// property access means it only ever runs in the browser.
let browserClient: SupabaseClient | null = null;
function getBrowserClient(): SupabaseClient {
  if (!browserClient) browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getBrowserClient(), prop, receiver);
  },
});

// Server-only client using the service role key. Never import this in
// client components — it bypasses Row Level Security.
export function createServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
