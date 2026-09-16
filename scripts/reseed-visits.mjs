// Re-seeds this month's visits for the two test members so the dashboard's
// "this month" query has current data. Safe to re-run any time.
// Run with: node scripts/reseed-visits.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    process.env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
}
loadEnvLocal();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const { data: gym, error: gymError } = await supabase
    .from("gyms")
    .select("*")
    .eq("email", "info@fitzone-zurich.ch")
    .single();
  if (gymError) throw gymError;

  const { data: anna, error: annaErr } = await supabase
    .from("members")
    .select("*")
    .eq("email", "anna@test.com")
    .single();
  if (annaErr) throw annaErr;

  const { data: manuel, error: manuelErr } = await supabase
    .from("members")
    .select("*")
    .eq("email", "manuel@test.com")
    .single();
  if (manuelErr) throw manuelErr;

  await supabase.from("visits").delete().eq("member_id", anna.id);
  await supabase.from("visits").delete().eq("member_id", manuel.id);

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const today = now.getUTCDate();

  function visitTimestamps(count) {
    const timestamps = [];
    for (let i = 0; i < count; i++) {
      const day = Math.min(1 + i * 2, today);
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

  console.log(`Seeded ${annaVisits.length} visits for Anna this month (Active tier)`);
  console.log(`Seeded ${manuelVisits.length} visits for Manuel this month (Starter tier)`);
}

main().then(
  () => {
    console.log("Reseed complete.");
    process.exit(0);
  },
  (err) => {
    console.error("Reseed failed:", err);
    process.exit(1);
  }
);
