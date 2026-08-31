// One-off seed script: inserts a test gym, two test members, and default tiers.
// Run with: node scripts/seed.mjs
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

async function main() {
  const { data: gym, error: gymError } = await supabase
    .from("gyms")
    .upsert(
      {
        name: "FitZone Zurich",
        email: "info@fitzone-zurich.ch",
        address: "Bahnhofstrasse 1, 8001 Zurich",
        lat: 47.3769,
        lng: 8.5417,
        plan: "growth",
      },
      { onConflict: "email" }
    )
    .select()
    .single();
  if (gymError) throw gymError;
  console.log("Seeded gym:", gym.id, gym.name);

  const defaultTiers = [
    { gym_id: gym.id, name: "Starter", min_visits: 0, max_visits: 2, price_chf: 129 },
    { gym_id: gym.id, name: "Regular", min_visits: 3, max_visits: 7, price_chf: 109 },
    { gym_id: gym.id, name: "Active", min_visits: 8, max_visits: 12, price_chf: 89 },
    { gym_id: gym.id, name: "Committed", min_visits: 13, max_visits: 19, price_chf: 69 },
    { gym_id: gym.id, name: "Champion", min_visits: 20, max_visits: null, price_chf: 49 },
  ];

  const { data: existingTiers } = await supabase
    .from("tiers")
    .select("id")
    .eq("gym_id", gym.id);

  let tiers = existingTiers;
  if (!existingTiers || existingTiers.length === 0) {
    const { data: insertedTiers, error: tiersError } = await supabase
      .from("tiers")
      .insert(defaultTiers)
      .select();
    if (tiersError) throw tiersError;
    tiers = insertedTiers;
  }
  console.log("Seeded tiers:", tiers.length);

  const { data: members, error: membersError } = await supabase
    .from("members")
    .upsert(
      [
        {
          gym_id: gym.id,
          name: "Anna Meier",
          email: "anna.meier@example.com",
          status: "active",
        },
        {
          gym_id: gym.id,
          name: "Luca Bernasconi",
          email: "luca.bernasconi@example.com",
          status: "active",
        },
      ],
      { onConflict: "gym_id,email" }
    )
    .select();
  if (membersError) throw membersError;
  console.log(
    "Seeded members:",
    members.map((m) => `${m.name} (${m.id})`)
  );
}

main().then(
  () => {
    console.log("Seed complete.");
    process.exit(0);
  },
  (err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  }
);
