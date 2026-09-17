import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side / anon-key client. Stores the session in cookies (not
// localStorage) via @supabase/ssr so middleware can read it on the server —
// that's what lets protected routes redirect before any page renders,
// instead of flashing the page and then bouncing to /login.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Server-only client using the service role key. Never import this in
// client components — it bypasses Row Level Security.
export function createServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
