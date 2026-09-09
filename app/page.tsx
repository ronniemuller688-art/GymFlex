import Link from "next/link";
import { TIERS } from "@/lib/tiers";

const STEPS = [
  {
    title: "Join at the entry price",
    desc: "Everyone starts at Starter. Your price drops as you build your habit.",
  },
  {
    title: "Check in every visit — 2 ways",
    desc: "Tap Check in when you arrive. GPS + QR scan at reception confirms you're there. 5 seconds.",
  },
  {
    title: "Watch your price drop",
    desc: "Visits counted monthly. More visits = lower price next month. Automatic.",
  },
];

// Dot colours and visit-range labels as coded in the S0 onboarding screen
// of wireframe/GymFlex_Wireframes_v4.html — intentionally distinct from the
// tier system's `colour`/`bg` values used elsewhere (dashboard, admin).
const WIREFRAME_TIER_ROWS = [
  { dot: "#ef4444", visitsLabel: "0–2 visits" },
  { dot: "#f97316", visitsLabel: "3–7 visits" },
  { dot: "#3b82f6", visitsLabel: "8–12 visits" },
  { dot: "#4ade80", visitsLabel: "13–19" },
  { dot: "#fbbf24", visitsLabel: "20+" },
];

export default function OnboardingPage() {
  return (
    <main
      className="app-shell flex flex-col overflow-y-auto"
      style={{
        background: "linear-gradient(160deg,#0a0a0a 0%,#0d1a12 100%)",
        padding: "20px 22px 16px",
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: 2 }}>
        Gym<span style={{ color: "#4ade80" }}>Flex</span>
      </div>
      <div style={{ fontSize: 11, color: "#444", marginBottom: 14 }}>
        The smarter gym membership
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 900, color: "white", lineHeight: 1.15, marginBottom: 6 }}>
        Work out more.
        <br />
        <span style={{ color: "#4ade80" }}>Pay less.</span>
      </h1>
      <p style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 12 }}>
        The more you visit, the less you pay — automatically.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {STEPS.map((step, i) => (
          <div key={step.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#4ade80",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 900,
                color: "#000",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 2 }}>
                {step.title}
              </div>
              <div style={{ fontSize: 11, color: "#555", lineHeight: 1.55 }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: 11, marginBottom: 14 }}>
        <div
          style={{
            fontSize: 10,
            color: "#444",
            textTransform: "uppercase",
            letterSpacing: ".08em",
            marginBottom: 10,
            fontWeight: 600,
          }}
        >
          Monthly visit tiers
        </div>
        {TIERS.map((tier, i) => {
          const savingVsEntry = TIERS[0].priceChf - tier.priceChf;
          const row = WIREFRAME_TIER_ROWS[i];
          const isLast = i === TIERS.length - 1;
          return (
            <div
              key={tier.name}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: isLast ? 0 : 9,
                gap: 8,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: row.dot }} />
              <div style={{ fontSize: 12, color: "#aaa", flex: 1, fontWeight: 500 }}>{tier.name}</div>
              <div style={{ fontSize: 10, color: "#444", marginRight: 4 }}>{row.visitsLabel}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>CHF {tier.priceChf}</div>
              {savingVsEntry > 0 && (
                <div style={{ fontSize: 9, color: "#4ade80", marginLeft: 4 }}>-{savingVsEntry}</div>
              )}
            </div>
          );
        })}
      </div>

      <Link
        href="/login"
        style={{
          background: "#4ade80",
          border: "none",
          borderRadius: 14,
          padding: 16,
          width: "100%",
          fontSize: 15,
          fontWeight: 900,
          color: "#000",
          textAlign: "center",
          display: "block",
        }}
      >
        Get started →
      </Link>
      <Link
        href="/login"
        style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "#444", display: "block" }}
      >
        Already a member? <span style={{ color: "#4ade80" }}>Sign in</span>
      </Link>
    </main>
  );
}
