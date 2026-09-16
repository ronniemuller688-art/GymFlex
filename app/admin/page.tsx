import Link from "next/link";
import { TIERS } from "@/lib/tiers";

// TODO: replace with live Supabase data once the admin UI is approved.
// Mirrors the wireframe's demo gym/members exactly.
const GYM = {
  name: "FitZone Zürich",
  monthLabel: "August 2026",
  activeMembers: 47,
};

const KPIS = [
  { label: "Monthly Revenue", value: "CHF 4,180", sub: "↑ +CHF 340 vs last month", tone: "up" as const },
  { label: "Active Members", value: "47", sub: "↑ 3 new this month", tone: "up" as const },
  { label: "Avg. Visits/Member", value: "9.2", sub: "↑ up from 7.8", tone: "up" as const },
  { label: "Churn Risk", value: "6", sub: "Starter 2+ months", tone: "warn" as const },
];

const TIER_DISTRIBUTION = [
  { tier: "Starter", pct: 13, colour: "#dc2626", text: "#f87171" },
  { tier: "Regular", pct: 19, colour: "#ea580c", text: "#fb923c" },
  { tier: "Active", pct: 28, colour: "#d97706", text: "#fbbf24" },
  { tier: "Committed", pct: 25, colour: "#2563eb", text: "#60a5fa" },
  { tier: "Champion", pct: 15, colour: "#ca8a04", text: "#fde047" },
];

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

type Member = {
  name: string;
  initials: string;
  avatarBg: string;
  visits: number;
  joined: string;
  planType: "monthly" | "yearly";
  tierName: string;
  note?: string;
  noteColor?: string;
};

const MEMBERS: Member[] = [
  {
    name: "Anna Meier",
    initials: "AM",
    avatarBg: "#2d7a3a",
    visits: 8,
    joined: "Mar 2026",
    planType: "yearly",
    tierName: "Active",
  },
  {
    name: "Luca Bernasconi",
    initials: "LB",
    avatarBg: "#7f1d1d",
    visits: 2,
    joined: "",
    planType: "monthly",
    tierName: "Starter",
    note: "⚠️ churn risk",
    noteColor: "#d97706",
  },
  {
    name: "Sara Rossi",
    initials: "SR",
    avatarBg: "#14532d",
    visits: 21,
    joined: "",
    planType: "yearly",
    tierName: "Champion",
    note: "🏆 champion",
  },
  {
    name: "Marco Keller",
    initials: "MK",
    avatarBg: "#4c1d95",
    visits: 14,
    joined: "",
    planType: "monthly",
    tierName: "Committed",
    note: "🔥 on a streak",
  },
];

function findTier(name: string) {
  return TIERS.find((t) => t.name === name)!;
}

function memberPriceLabel(member: Member) {
  const tier = findTier(member.tierName);
  if (member.planType === "yearly") {
    return `CHF ${Math.round(tier.priceChf * 0.9)}/mo yearly`;
  }
  return `CHF ${tier.priceChf} next mo.`;
}

export default function AdminPage() {
  return (
    <main className="app-shell flex flex-col" style={{ background: "#0a0a0a", overflowY: "auto" }}>
      <div style={{ padding: "20px 18px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "white", fontSize: 17, fontWeight: 800 }}>{GYM.name}</div>
          <div style={{ color: "#444", fontSize: 11, marginTop: 2 }}>
            {GYM.monthLabel} · {GYM.activeMembers} active members
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
          }}
        >
          Admin
        </div>
      </div>

      <div style={{ background: "#1a0f00", borderLeft: "3px solid #f97316", padding: "10px 16px", display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div style={{ fontSize: 11, color: "#d97706", lineHeight: 1.5 }}>
          <strong style={{ color: "#f97316" }}>⚠️ 6 members</strong> stuck on Starter tier 2+ months — high churn
          risk. Consider reaching out.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "14px 16px 8px" }}>
        {KPIS.map((kpi) => (
          <div key={kpi.label} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: 13 }}>
            <div style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: kpi.tone === "warn" ? "#f97316" : "white" }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 10, marginTop: 2, color: kpi.tone === "up" ? "#4ade80" : "#f97316" }}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      <div style={{ margin: "8px 16px", background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: 12 }}>
        <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
          Tier distribution this month
        </div>
        <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 2, marginBottom: 8 }}>
          {TIER_DISTRIBUTION.map((t) => (
            <div key={t.tier} style={{ width: `${t.pct}%`, height: 8, borderRadius: 2, background: t.colour }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TIER_DISTRIBUTION.map((t) => (
            <div key={t.tier} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#555" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.colour }} />
              <span style={{ color: t.text }}>
                {t.tier} {t.pct}%
              </span>
            </div>
          ))}
        </div>
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

      {MEMBERS.map((member) => {
        const tier = findTier(member.tierName);
        return (
          <div key={member.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderTop: "1px solid #111" }}>
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
                background: member.avatarBg,
              }}
            >
              {member.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "white" }}>{member.name}</div>
              <div style={{ fontSize: 10, color: "#444", marginTop: 1 }}>
                {member.visits} visits
                {member.joined && ` · joined ${member.joined}`}
                {member.note && (
                  <>
                    {" · "}
                    <span style={{ color: member.noteColor ?? undefined }}>{member.note}</span>
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
                  background: BADGE_BG[tier.name],
                  color: tier.text,
                }}
              >
                {tier.name}
              </span>
              <div style={{ fontSize: 10, color: "#444" }}>{memberPriceLabel(member)}</div>
            </div>
          </div>
        );
      })}
    </main>
  );
}
