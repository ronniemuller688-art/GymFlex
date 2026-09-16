"use client";

import { useEffect, useState } from "react";
import {
  TIERS,
  getTierForVisits,
  getNextTier,
  tierCardGradientFrom,
  tierCardBorder,
  darken,
} from "@/lib/tiers";

// TODO: replace with a live Supabase fetch once 0003_add_plan_type.sql has
// been run — see supabase/migrations/0003_add_plan_type.sql. Values below
// mirror the requested test member exactly: anna@test.com, 8 visits this
// month, Active tier, monthly plan.
const MOCK_MEMBER = {
  name: "Anna Meier",
  gymName: "FitZone Zürich",
  visitsThisMonth: 8,
  planType: "monthly" as "monthly" | "yearly",
};

const MOCK_RECENT_VISITS = [
  { label: "Today, Mon 31 Aug", time: "07:14" },
  { label: "Sat 29 Aug", time: "09:32" },
  { label: "Thu 27 Aug", time: "18:05" },
];

const TIER_EMOJI: Record<string, string> = {
  Active: "⚡",
  Champion: "🏆",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function useGreeting() {
  const [greeting, setGreeting] = useState("Hello,");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning,");
    else if (hour < 18) setGreeting("Good afternoon,");
    else setGreeting("Good evening,");
  }, []);
  return greeting;
}

export default function DashboardPage() {
  const [planType, setPlanType] = useState<"monthly" | "yearly">(MOCK_MEMBER.planType);
  const greeting = useGreeting();

  const visits = MOCK_MEMBER.visitsThisMonth;
  const tier = getTierForVisits(visits);
  const nextTier = getNextTier(tier);
  const savedVsEntry = TIERS[0].priceChf - tier.priceChf;

  // Yearly pricing isn't in the schema yet (tiers only stores a monthly
  // price_chf) — the dashboard toggle itself advertises "-10%", so that's
  // the discount applied here for the yearly preview. Purely a display
  // convenience; nothing is persisted from toggling this.
  const displayPrice = (chf: number) =>
    planType === "yearly" ? Math.round(chf * 0.9) : chf;

  const now = new Date();
  const nextMonth = MONTH_NAMES[(now.getMonth() + 1) % 12];
  const currentMonth = MONTH_NAMES[now.getMonth()];

  const visitsToNext = nextTier ? Math.max(nextTier.minVisits - visits, 0) : 0;
  const progressPct = nextTier
    ? Math.min(100, Math.max(0, (visits / nextTier.minVisits) * 100))
    : 100;

  return (
    <main className="app-shell flex flex-col" style={{ background: "#0a0a0a" }}>
      <div
        style={{
          padding: "22px 18px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ color: "#444", fontSize: 11, marginBottom: 2 }}>{greeting}</div>
          <div style={{ color: "white", fontSize: 18, fontWeight: 800 }}>
            {MOCK_MEMBER.name} 👋
          </div>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#4ade80",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 800,
            color: "#000",
          }}
        >
          {initials(MOCK_MEMBER.name)}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "0 16px 10px" }}>
        <div style={{ display: "flex", background: "#111", border: "1px solid #1a1a1a", borderRadius: 24, padding: 3, gap: 3 }}>
          <button
            onClick={() => setPlanType("monthly")}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              background: planType === "monthly" ? "#4ade80" : "transparent",
              color: planType === "monthly" ? "#000" : "#444",
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setPlanType("yearly")}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              background: planType === "yearly" ? "#4ade80" : "transparent",
              color: planType === "yearly" ? "#000" : "#444",
            }}
          >
            Yearly{" "}
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                background: "#d97706",
                color: "#000",
                padding: "2px 6px",
                borderRadius: 20,
                marginLeft: 4,
              }}
            >
              -10%
            </span>
          </button>
        </div>
      </div>

      <div
        style={{
          margin: "0 16px 14px",
          background: `linear-gradient(135deg,${tierCardGradientFrom(tier)},${tier.bg})`,
          border: `1px solid ${tierCardBorder(tier)}`,
          borderRadius: 20,
          padding: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: tier.text, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600, marginBottom: 4 }}>
              Current tier
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: tier.text, letterSpacing: "-1px" }}>
              {TIER_EMOJI[tier.name] ? `${TIER_EMOJI[tier.name]} ` : ""}
              {tier.name}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#444", marginBottom: 2 }}>
              {planType === "monthly" ? "Next month" : "Your plan"}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: tier.text }}>
              CHF {displayPrice(tier.priceChf)}
            </div>
            <div style={{ fontSize: 9, color: "#444" }}>
              {planType === "monthly" ? `billed 1 ${nextMonth}` : "billed annually"}
            </div>
          </div>
        </div>

        {nextTier && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#444", marginBottom: 6 }}>
              <span>{visits} visits this month</span>
              <span style={{ color: tier.text }}>
                {visitsToNext} more → CHF {displayPrice(nextTier.priceChf)} 💚
              </span>
            </div>
            <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, marginBottom: 8 }}>
              <div
                style={{
                  height: 6,
                  background: `linear-gradient(90deg,${tier.colour},${tier.text})`,
                  borderRadius: 3,
                  width: `${progressPct}%`,
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: "#555" }}>
              {planType === "monthly" ? (
                <>
                  Hit <strong style={{ color: tier.text }}>{nextTier.minVisits} visits</strong> by end of{" "}
                  {currentMonth} → drop to{" "}
                  <strong style={{ color: tier.text }}>CHF {nextTier.priceChf}</strong>
                </>
              ) : (
                <>
                  Yearly plan active — your rate is locked at{" "}
                  <strong style={{ color: tier.text }}>CHF {displayPrice(tier.priceChf)}/mo</strong>
                </>
              )}
            </div>
          </>
        )}
        {!nextTier && (
          <div style={{ fontSize: 11, color: "#555" }}>You&apos;re at the top tier! Keep it up 🏆</div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "0 16px 14px" }}>
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "white" }}>{visits}</div>
          <div style={{ fontSize: 9, color: "#444", marginTop: 2, textTransform: "uppercase", letterSpacing: ".05em" }}>
            Visits
          </div>
          <div style={{ fontSize: 9, color: tier.text, marginTop: 1 }}>this month</div>
        </div>
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#4ade80" }}>CHF {displayPrice(tier.priceChf)}</div>
          <div style={{ fontSize: 9, color: "#444", marginTop: 2, textTransform: "uppercase", letterSpacing: ".05em" }}>
            Next price
          </div>
          <div style={{ fontSize: 9, color: "#444", marginTop: 1 }}>{nextMonth} 1st</div>
        </div>
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: tier.text }}>CHF {savedVsEntry}</div>
          <div style={{ fontSize: 9, color: "#444", marginTop: 2, textTransform: "uppercase", letterSpacing: ".05em" }}>
            Saved
          </div>
          <div style={{ fontSize: 9, color: "#4ade80", marginTop: 1 }}>vs entry</div>
        </div>
      </div>

      <div
        style={{
          margin: "0 16px 16px",
          background: tier.colour,
          borderRadius: 18,
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: darken(tier.colour, 0.45), fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>
            Tap to log a visit
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff8e7" }}>Check in now</div>
          <div style={{ fontSize: 11, color: darken(tier.colour, 0.3), marginTop: 1 }}>
            📍 {MOCK_MEMBER.gymName}
          </div>
        </div>
        <div style={{ fontSize: 28, color: "#fff8e7" }}>→</div>
      </div>

      <div style={{ fontSize: 10, fontWeight: 600, color: "#444", textTransform: "uppercase", letterSpacing: ".08em", padding: "0 16px 8px" }}>
        Recent visits
      </div>
      {MOCK_RECENT_VISITS.length === 0 ? (
        <div style={{ padding: "0 16px 16px", fontSize: 12, color: "#555" }}>
          No visits yet this month — check in when you arrive!
        </div>
      ) : (
        MOCK_RECENT_VISITS.map((v) => (
          <div
            key={v.label + v.time}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderTop: "1px solid #111" }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: "#888", flex: 1 }}>{v.label}</div>
            <div style={{ fontSize: 9, background: "#0d2818", color: "#4ade80", padding: "2px 7px", borderRadius: 20 }}>
              +1
            </div>
            <div style={{ fontSize: 11, color: "#444" }}>{v.time}</div>
          </div>
        ))
      )}

      <div style={{ fontSize: 10, fontWeight: 600, color: "#444", textTransform: "uppercase", letterSpacing: ".08em", padding: "0 16px 8px", marginTop: 6 }}>
        All tiers
      </div>
      <div style={{ padding: "0 16px 20px" }}>
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 16, overflow: "hidden" }}>
          {TIERS.map((t, i) => {
            const currentIndex = TIERS.findIndex((x) => x.name === tier.name);
            const isCurrent = t.name === tier.name;
            const isPast = i < currentIndex;
            const isLast = i === TIERS.length - 1;
            const visitsLabel =
              t.maxVisits === null ? `${t.minVisits}+ visits` : `${t.minVisits}–${t.maxVisits} visits`;
            const label = t.name === "Champion" ? "Champion 🏆" : t.name;

            return (
              <div
                key={t.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 14px",
                  borderBottom: isLast ? "none" : "1px solid #1a1a1a",
                  background: isCurrent ? t.bg : undefined,
                  borderLeft: isCurrent ? `3px solid ${t.colour}` : undefined,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: t.colour,
                    flexShrink: 0,
                    opacity: isCurrent ? 1 : isPast ? 1 : 0.5,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    fontSize: 12,
                    color: t.text,
                    opacity: isCurrent ? 1 : isPast ? 0.6 : 0.5,
                    fontWeight: isCurrent ? 600 : 500,
                  }}
                >
                  {label}
                  {isCurrent && (
                    <span
                      style={{
                        fontSize: 9,
                        background: t.colour,
                        color: "#000",
                        padding: "1px 6px",
                        borderRadius: 20,
                        marginLeft: 4,
                        fontWeight: 700,
                      }}
                    >
                      YOU
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: isCurrent ? t.text : isPast ? "#444" : "#333",
                    opacity: isCurrent ? 0.6 : 1,
                    marginRight: 8,
                  }}
                >
                  {visitsLabel}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isCurrent ? t.text : isPast ? "#555" : "#444",
                  }}
                >
                  CHF {displayPrice(t.priceChf)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
