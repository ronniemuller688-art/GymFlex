// Seeds Supabase Auth users for local testing + aligns members table emails
// and visit counts with the CONTEXT.md seed-data reminder.
// Run with: node scripts/seed-auth.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx);
    const value = trimmed.slice(idx + 1);
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function upsertAuthUser(email, password, role) {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing.users.find((u) => u.email === email);
  if (found) {
    const { data, error } = await supabase.auth.admin.updateUserById(found.id, {
      password,
      user_metadata: { role },
      email_confirm: true,
    });
    if (error) throw error;
    return data.user;
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role },
  });
  if (error) throw error;
  return data.user;
}

async function main() {
  const { data: gym, error: gymError } = await supabase
    .from("gyms")
    .select("*")
    .eq("name", "FitZone Zurich")
    .single();
  if (gymError) throw gymError;

  // Admin auth user for the gym (matches gyms.email for role lookup).
  const adminUser = await upsertAuthUser(gym.email, "gymflex123", "admin");
  console.log("Admin auth user:", adminUser.email, adminUser.id);

  // Realign member rows with the CONTEXT.md test emails.
  const { data: anna, error: annaErr } = await supabase
    .from("members")
    .update({ email: "anna@test.com" })
    .eq("name", "Anna Meier")
    .select()
    .single();
  if (annaErr) throw annaErr;

  const { data: manuel, error: manuelErr } = await supabase
    .from("members")
    .update({ name: "Manuel Keller", email: "manuel@test.com" })
    .eq("name", "Luca Bernasconi")
    .select()
    .single();
  if (manuelErr) throw manuelErr;

  await upsertAuthUser(anna.email, "gymflex123", "member");
  await upsertAuthUser(manuel.email, "gymflex123", "member");
  console.log("Member auth users created: anna@test.com, manuel@test.com");

  // Reset and seed this month's visits: Anna → 8 (Active), Manuel → 2 (Starter).
  await supabase.from("visits").delete().eq("member_id", anna.id);
  await supabase.from("visits").delete().eq("member_id", manuel.id);

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  function visitTimestamps(count) {
    const timestamps = [];
    for (let i = 0; i < count; i++) {
      const day = Math.min(1 + i * 2, 28);
      timestamps.push(new Date(Date.UTC(year, month, day, 9, 0, 0)).toISOString());
    }
    return timestamps;
  }

  const annaVisits = visitTimestamps(8).map((visited_at) => ({
    member_id: anna.id,
    gym_id: gym.id,
    visited_at,
  }));
  const manuelVisits = visitTimestamps(2).map((visited_at) => ({
    member_id: manuel.id,
    gym_id: gym.id,
    visited_at,
  }));

  const { error: visitsErr } = await supabase
    .from("visits")
    .insert([...annaVisits, ...manuelVisits]);
  if (visitsErr) throw visitsErr;

  console.log(`Seeded ${annaVisits.length} visits for Anna (Active tier)`);
  console.log(`Seeded ${manuelVisits.length} visits for Manuel (Starter tier)`);
}

main().then(
  () => {
    console.log("Auth + visit seed complete.");
    process.exit(0);
  },
  (err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  }
);
