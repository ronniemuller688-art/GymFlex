"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { TIERS, getTierForVisits, type Tier } from "@/lib/tiers";

// Badge background per tier as coded in the wireframe's member rows — Active
// uses a lighter tint (#3a2800) than tiers.ts's own tier.bg (#2a1e00); the
// rest match tier.bg exactly. Kept literal here rather than generalised,
// since it's this screen's specific styling choice, not a system token.
const BADGE_BG: Record<string, string> = {
  Starter: "#2a0a0a",
  Regular: "#2a1200",
  Active: "#3a2800",
  Committed: "#0f1e4a",
  Champion: "#2a1f00",
};

// No avatar-colour column in the schema — pick a deterministic colour per
// member from a fixed palette so it stays stable across reloads.
const AVATAR_PALETTE = ["#2d7a3a", "#7f1d1d", "#14532d", "#4c1d95", "#1d4ed8", "#a16207", "#9d174d", "#0f766e"];
function avatarColour(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type MemberRow = {
  id: string;
  name: string;
  createdAt: string;
  planType: "monthly" | "yearly";
  visitsThisMonth: number;
  visitsLastMonth: number;
  tier: Tier;
  tierLastMonth: Tier;
};

type AdminData = {
  gymName: string;
  monthLabel: string;
  members: MemberRow[];
  revenueThisMonth: number;
  revenueDelta: number | null;
  newThisMonth: number;
  avgVisits: number;
  avgVisitsLastMonth: number | null;
  churnRiskCount: number;
  tierDistribution: { tier: Tier; count: number; pct: number }[];
};

function memberPriceLabel(tier: Tier, planType: "monthly" | "yearly") {
  if (planType === "yearly") {
    return `CHF ${Math.round(tier.priceChf * 0.9)}/mo yearly`;
  }
  return `CHF ${tier.priceChf} next mo.`;
}

function monthYear(date: Date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

async function fetchAdminData(email: string): Promise<AdminData | null> {
  const { data: gym, error: gymError } = await supabase
    .from("gyms")
    .select("id, name")
    .eq("email", email)
    .maybeSingle();
  if (gymError || !gym) return null;

  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("id, name, created_at, plan_type")
    .eq("gym_id", gym.id)
    .eq("status", "active");
  if (membersError || !members) return null;

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [{ data: visitsThis }, { data: visitsLast }] = await Promise.all([
    supabase
      .from("visits")
      .select("member_id")
      .eq("gym_id", gym.id)
      .gte("visited_at", startOfThisMonth.toISOString()),
    supabase
      .from("visits")
      .select("member_id")
      .eq("gym_id", gym.id)
      .gte("visited_at", startOfLastMonth.toISOString())
      .lt("visited_at", startOfThisMonth.toISOString()),
  ]);

  const countByMember = (rows: { member_id: string }[] | null) => {
    const map = new Map<string, number>();
    for (const row of rows ?? []) map.set(row.member_id, (map.get(row.member_id) ?? 0) + 1);
    return map;
  };
  const thisMonthCounts = countByMember(visitsThis);
  const lastMonthCounts = countByMember(visitsLast);

  const memberRows: MemberRow[] = members.map((m) => {
    const visitsThisMonth = thisMonthCounts.get(m.id) ?? 0;
    const visitsLastMonth = lastMonthCounts.get(m.id) ?? 0;
    return {
      id: m.id,
      name: m.name,
      createdAt: m.created_at,
      planType: (m.plan_type as "monthly" | "yearly") ?? "monthly",
      visitsThisMonth,
      visitsLastMonth,
      tier: getTierForVisits(visitsThisMonth),
      tierLastMonth: getTierForVisits(visitsLastMonth),
    };
  });

  // Revenue is derived from each member's live current-tier price rather
  // than a locked-in member_tiers row (that table isn't populated by any
  // job yet) — a reasonable stand-in, not real billing history.
  const revenueThisMonth = memberRows.reduce((sum, m) => sum + m.tier.priceChf, 0);
  const hasLastMonthData = (visitsLast?.length ?? 0) > 0;
  const revenueLastMonth = hasLastMonthData
    ? memberRows.reduce((sum, m) => sum + m.tierLastMonth.priceChf, 0)
    : null;

  const newThisMonth = memberRows.filter((m) => new Date(m.createdAt) >= startOfThisMonth).length;

  const avgVisits = memberRows.length
    ? memberRows.reduce((sum, m) => sum + m.visitsThisMonth, 0) / memberRows.length
    : 0;
  const avgVisitsLastMonth = hasLastMonthData
    ? memberRows.reduce((sum, m) => sum + m.visitsLastMonth, 0) / memberRows.length
    : null;

  // "2+ months on Starter" approximated as Starter this month AND last
  // month — only two months of history are available from raw visits.
  const churnRiskCount = memberRows.filter(
    (m) => m.tier.name === "Starter" && m.tierLastMonth.name === "Starter"
  ).length;

  const tierDistribution = TIERS.map((tier) => {
    const count = memberRows.filter((m) => m.tier.name === tier.name).length;
    return { tier, count, pct: memberRows.length ? Math.round((count / memberRows.length) * 100) : 0 };
  }).filter((t) => t.count > 0);

  return {
    gymName: gym.name,
    monthLabel: monthYear(now),
    members: memberRows,
    revenueThisMonth,
    revenueDelta: revenueLastMonth === null ? null : revenueThisMonth - revenueLastMonth,
    newThisMonth,
    avgVisits,
    avgVisitsLastMonth,
    churnRiskCount,
    tierDistribution,
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user?.email) {
        router.replace("/login");
        return;
      }
      const adminData = await fetchAdminData(user.email);
      if (cancelled) return;
      if (!adminData) {
        router.replace("/login");
        return;
      }
      setData(adminData);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading || !data) {
    return (
      <main className="app-shell flex flex-col items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div style={{ color: "#555", fontSize: 13 }}>Loading…</div>
      </main>
    );
  }

  const kpis = [
    {
      label: "Monthly Revenue",
      value: `CHF ${data.revenueThisMonth.toLocaleString()}`,
      sub:
        data.revenueDelta === null
          ? "No data for last month"
          : `${data.revenueDelta >= 0 ? "↑" : "↓"} ${data.revenueDelta >= 0 ? "+" : ""}CHF ${data.revenueDelta} vs last month`,
      tone: data.revenueDelta === null || data.revenueDelta >= 0 ? ("up" as const) : ("warn" as const),
    },
    {
      label: "Active Members",
      value: String(data.members.length),
      sub: `↑ ${data.newThisMonth} new this month`,
      tone: "up" as const,
    },
    {
      label: "Avg. Visits/Member",
      value: data.avgVisits.toFixed(1),
      sub:
        data.avgVisitsLastMonth === null
          ? "No data for last month"
          : `${data.avgVisits >= data.avgVisitsLastMonth ? "↑ up" : "↓ down"} from ${data.avgVisitsLastMonth.toFixed(1)}`,
      tone: "up" as const,
    },
    {
      label: "Churn Risk",
      value: String(data.churnRiskCount),
      sub: "Starter 2+ months",
      tone: "warn" as const,
    },
  ];

  return (
    <main className="app-shell flex flex-col" style={{ background: "#0a0a0a", overflowY: "auto" }}>
      <div className="flex items-start justify-between gap-3" style={{ padding: "20px 18px 14px" }}>
        <div className="min-w-0 flex-1">
          <div className="truncate" style={{ color: "white", fontSize: 17, fontWeight: 800 }}>
            {data.gymName}
          </div>
          <div className="truncate" style={{ color: "#444", fontSize: 11, marginTop: 2 }}>
            {data.monthLabel} · {data.members.length} active members
          </div>
        </div>
        <div
          style={{
            background: "#4ade80",
            color: "#000",
            fontSize: 9,
            fontWeight: 800,
            padding: "4px 10px",
            borderRadius: 20,
            textTransform: "uppercase",
            letterSpacing: ".05em",
            flexShrink: 0,
          }}
        >
          Admin
        </div>
      </div>

      {data.churnRiskCount > 0 && (
        <div style={{ background: "#1a0f00", borderLeft: "3px solid #f97316", padding: "10px 16px", display: "flex", gap: 8, alignItems: "flex-start" }}>
          <div style={{ fontSize: 11, color: "#d97706", lineHeight: 1.5 }}>
            <strong style={{ color: "#f97316" }}>
              ⚠️ {data.churnRiskCount} member{data.churnRiskCount === 1 ? "" : "s"}
            </strong>{" "}
            stuck on Starter tier 2+ months — high churn risk. Consider reaching out.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 8, padding: "14px 16px 8px" }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className="min-w-0" style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: 13 }}>
            <div className="truncate" style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 }}>
              {kpi.label}
            </div>
            <div className="truncate" style={{ fontSize: 20, fontWeight: 800, color: kpi.tone === "warn" ? "#f97316" : "white" }}>
              {kpi.value}
            </div>
            <div className="truncate" style={{ fontSize: 10, marginTop: 2, color: kpi.tone === "up" ? "#4ade80" : "#f97316" }}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      <div style={{ margin: "8px 16px", background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: 12 }}>
        <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
          Tier distribution this month
        </div>
        {data.tierDistribution.length === 0 ? (
          <div style={{ fontSize: 11, color: "#555" }}>No members yet</div>
        ) : (
          <>
            <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 2, marginBottom: 8 }}>
              {data.tierDistribution.map((t) => (
                <div key={t.tier.name} style={{ width: `${t.pct}%`, height: 8, borderRadius: 2, background: t.tier.colour }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {data.tierDistribution.map((t) => (
                <div key={t.tier.name} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#555" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.tier.colour }} />
                  <span style={{ color: t.tier.text }}>
                    {t.tier.name} {t.pct}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ margin: "0 16px 8px", background: "#0a1a2e", border: "1px solid #1a2a3e", borderRadius: 12, padding: "11px 13px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ fontSize: 18 }}>📟</div>
        <div style={{ fontSize: 11, color: "#6b9fd4", lineHeight: 1.5 }}>
          <strong style={{ color: "#90c4f0" }}>Tablet QR display active</strong> — your reception tablet is showing
          today&apos;s rotating check-in code. Code refreshes every hour automatically.
          <br />
          <Link href="/tablet" target="_blank" style={{ color: "#90c4f0", fontWeight: 600 }}>
            View tablet display →
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px 6px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "white" }}>Members</div>
        <Link
          href="/admin/import"
          style={{ background: "#111", border: "1px solid #333", color: "#aaa", fontSize: 10, padding: "5px 12px", borderRadius: 20, cursor: "pointer" }}
        >
          + Import CSV
        </Link>
      </div>

      <div className="max-h-[320px] overflow-y-auto sm:max-h-none sm:overflow-visible">
        {data.members.length === 0 ? (
          <div style={{ padding: "0 16px 16px", fontSize: 12, color: "#555" }}>No active members yet.</div>
        ) : (
          data.members.map((member) => {
            const isChurnRisk = member.tier.name === "Starter" && member.tierLastMonth.name === "Starter";
            const isChampion = member.tier.name === "Champion";
            const isStreak = !isChurnRisk && !isChampion && member.visitsThisMonth > member.visitsLastMonth;
            const joined = new Date(member.createdAt);

            return (
              <div key={member.id} className="min-w-0" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderTop: "1px solid #111" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "white",
                    flexShrink: 0,
                    background: avatarColour(member.name),
                  }}
                >
                  {initials(member.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate" style={{ fontSize: 12, fontWeight: 600, color: "white" }}>
                    {member.name}
                  </div>
                  <div className="truncate" style={{ fontSize: 10, color: "#444", marginTop: 1 }}>
                    {member.visitsThisMonth} visits · joined {MONTH_NAMES[joined.getMonth()].slice(0, 3)}{" "}
                    {joined.getFullYear()}
                    {isChurnRisk && (
                      <>
                        {" · "}
                        <span style={{ color: "#d97706" }}>⚠️ churn risk</span>
                      </>
                    )}
                    {isChampion && (
                      <>
                        {" · "}
                        <span>🏆 champion</span>
                      </>
                    )}
                    {isStreak && (
                      <>
                        {" · "}
                        <span>🔥 on a streak</span>
                      </>
                    )}
                    {" · "}
                    <span style={{ color: member.planType === "yearly" ? "#4ade80" : "#666" }}>
                      {member.planType === "yearly" ? "Yearly plan" : "Monthly"}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 20,
                      display: "inline-block",
                      marginBottom: 2,
                      background: BADGE_BG[member.tier.name],
                      color: member.tier.text,
                    }}
                  >
                    {member.tier.name}
                  </span>
                  <div style={{ fontSize: 10, color: "#444" }}>{memberPriceLabel(member.tier, member.planType)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
