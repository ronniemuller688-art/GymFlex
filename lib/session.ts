import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "member" | null;

// Role is resolved by looking up the signed-in user's email in the gyms
// and members tables — there is no separate role column on auth.users.
export async function resolveRoleAndRedirect(email: string): Promise<{
  role: UserRole;
  redirectTo: string;
}> {
  const { data: gym } = await supabase
    .from("gyms")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (gym) return { role: "admin", redirectTo: "/admin" };

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (member) return { role: "member", redirectTo: "/dashboard" };

  return { role: null, redirectTo: "/login" };
}
