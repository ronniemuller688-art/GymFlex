"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTierForVisits, getNextTier } from "@/lib/tiers";

const GUIDE_SEEN_KEY = "gymflex_checkin_seen";
const GYM_NAME = "FitZone Zürich";

// Mock member state for this frontend-only pass — matches the dashboard's
// test data (Anna, 8 visits -> Active). No Supabase calls yet.
const MOCK_VISITS_THIS_MONTH = 8;

type View = "scanning" | "success" | "error-gps" | "error-qr";

const GUIDE_STEPS = [
  {
    title: "Arrive at the gym",
    desc: "Be physically inside or at the entrance. GPS confirms you're within 50m — not from home, not from the street outside.",
  },
  {
    title: 'Tap "Check in now"',
    desc: "The app checks your GPS automatically. If you're in range, the QR scanner opens.",
  },
  {
    title: "Scan the tablet at reception",
    desc: "The gym has a tablet showing a QR code. Point your phone at it. The code changes every hour so it can't be faked.",
  },
  {
    title: "Done — visit logged",
    desc: "Your monthly visit count updates instantly. You'll see your progress toward the next tier.",
  },
];

function QrGrid({ size }: { size: number }) {
  const cells = Array.from({ length: 64 }, (_, i) => (i * 37) % 100 > 45);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(8,1fr)",
        gap: 2,
        padding: size === 180 ? 16 : 18,
        width: "100%",
        height: "100%",
      }}
    >
      {cells.map((on, i) => (
        <div key={i} style={{ borderRadius: 1, background: on ? "#4ade80" : "#1a1a1a" }} />
      ))}
    </div>
  );
}

export default function CheckinPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("scanning");
  const [guideOpen, setGuideOpen] = useState(false);

  const tier = getTierForVisits(MOCK_VISITS_THIS_MONTH);
  const nextTier = getNextTier(tier);

  useEffect(() => {
    const seen = window.localStorage.getItem(GUIDE_SEEN_KEY);
    if (!seen) setGuideOpen(true);
  }, []);

  function closeGuide() {
    window.localStorage.setItem(GUIDE_SEEN_KEY, "1");
    setGuideOpen(false);
  }

  function reset() {
    setView("scanning");
  }

  const now = new Date();
  const visitDate = now.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  const visitTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <main className="app-shell flex flex-col" style={{ background: "#0a0a0a", position: "relative", overflow: "hidden" }}>
      <div
        style={{
          padding: "20px 18px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          onClick={() => router.push("/dashboard")}
          style={{ color: tier.colour, fontSize: 20, cursor: "pointer" }}
        >
          ←
        </span>
        <div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Check in</div>
        <div
          onClick={() => setGuideOpen(true)}
          style={{
            fontSize: 11,
            color: "#4ade80",
            background: "#0d2818",
            border: "1px solid #1a3a22",
            padding: "5px 12px",
            borderRadius: 20,
            cursor: "pointer",
          }}
        >
          ? Guide
        </div>
      </div>

      {view === "scanning" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: "0 0 auto" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  background: "#0d2818",
                  color: tier.colour,
                  border: `1.5px solid ${tier.colour}`,
                }}
              >
                ✓
              </div>
              <div style={{ marginTop: 4, fontSize: 9, color: tier.colour, textAlign: "center", textTransform: "uppercase", letterSpacing: ".05em" }}>
                GPS
              </div>
            </div>
            <div style={{ flex: 1, height: 2, background: tier.colour, margin: "0 8px", marginBottom: 18 }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: "0 0 auto" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  background: tier.colour,
                  color: "#000",
                }}
              >
                2
              </div>
              <div style={{ marginTop: 4, fontSize: 9, color: "#aaa", textAlign: "center", textTransform: "uppercase", letterSpacing: ".05em" }}>
                QR Scan
              </div>
            </div>
            <div style={{ flex: 1, height: 2, background: "#1a1a1a", margin: "0 8px", marginBottom: 18 }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: "0 0 auto" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  background: "#111",
                  color: "#444",
                  border: "1.5px solid #222",
                }}
              >
                3
              </div>
              <div style={{ marginTop: 4, fontSize: 9, color: "#444", textAlign: "center", textTransform: "uppercase", letterSpacing: ".05em" }}>
                Done
              </div>
            </div>
          </div>

          <div
            style={{
              width: 180,
              height: 180,
              background: "#111",
              border: `2px solid ${tier.colour}`,
              borderRadius: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <QrGrid size={180} />
            <div style={{ position: "absolute", width: 28, height: 28, top: 14, left: 14, border: `3px solid ${tier.colour}`, borderRadius: 4, borderRight: "none", borderBottom: "none" }} />
            <div style={{ position: "absolute", width: 28, height: 28, top: 14, right: 14, border: `3px solid ${tier.colour}`, borderRadius: 4, borderLeft: "none", borderBottom: "none" }} />
            <div style={{ position: "absolute", width: 28, height: 28, bottom: 14, left: 14, border: `3px solid ${tier.colour}`, borderRadius: 4, borderRight: "none", borderTop: "none" }} />
            <div className="scan-line" style={{ background: `linear-gradient(90deg,transparent,${tier.colour},transparent)` }} />
          </div>

          <div style={{ fontSize: 13, color: "#888", textAlign: "center", lineHeight: 1.6, marginBottom: 6 }}>
            Point your camera at the <strong style={{ color: "white" }}>QR code on the tablet</strong> at gym reception
          </div>
          <div style={{ fontSize: 11, color: "#444", textAlign: "center" }}>
            Code refreshes in <span style={{ color: "#f97316", fontWeight: 600 }}>43 min</span>
          </div>

          <style jsx>{`
            .scan-line {
              position: absolute;
              width: 80%;
              height: 2px;
              animation: scanline 2s infinite;
            }
            @keyframes scanline {
              0% {
                top: 20px;
              }
              100% {
                top: 155px;
              }
            }
          `}</style>
        </div>
      )}

      {view === "success" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 22px" }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              marginBottom: 18,
              background: "#0d2818",
              border: "2px solid #4ade80",
            }}
          >
            ✅
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 6, textAlign: "center" }}>
            Checked in! 🎉
          </div>
          <div style={{ fontSize: 12, color: "#555", textAlign: "center", lineHeight: 1.6, marginBottom: 18 }}>
            Visit logged at {GYM_NAME}
            <br />
            {visitDate} · {visitTime}
          </div>
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: "13px 16px", width: "100%", marginBottom: 14 }}>
            <InfoRow label="Visits this month" value={`${MOCK_VISITS_THIS_MONTH + 1} ↑`} green />
            <InfoRow
              label="Visits to next tier"
              value={nextTier ? `${Math.max(nextTier.minVisits - (MOCK_VISITS_THIS_MONTH + 1), 0)} more` : "You're top tier"}
            />
            <InfoRow label="Next month's price" value={`CHF ${tier.priceChf}`} />
            {nextTier && (
              <InfoRow label={`Hit ${nextTier.name}?`} value={`Save CHF ${tier.priceChf - nextTier.priceChf} more`} green last />
            )}
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            style={{ width: "100%", padding: 14, background: "#4ade80", color: "#000", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 900, cursor: "pointer" }}
          >
            ← Back to dashboard
          </button>
        </div>
      )}

      {view === "error-gps" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 22px" }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              marginBottom: 18,
              background: "#1a0a0a",
              border: "2px solid #b91c1c",
            }}
          >
            ❌
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 6, textAlign: "center" }}>
            Not at the gym
          </div>
          <div style={{ fontSize: 12, color: "#555", textAlign: "center", lineHeight: 1.6, marginBottom: 18 }}>
            Your GPS shows you&apos;re more than 50m from {GYM_NAME}. Walk inside and try again.
          </div>
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: "13px 16px", width: "100%", marginBottom: 14 }}>
            <InfoRow label="Your location" value="Too far away" valueColor="#f87171" />
            <InfoRow label="Required" value="Within 50m" last />
          </div>
          <button
            onClick={reset}
            style={{ width: "100%", padding: 14, background: "#111", color: "#f87171", border: "1px solid #b91c1c", borderRadius: 14, fontSize: 15, fontWeight: 900, cursor: "pointer", marginBottom: 8 }}
          >
            Try again
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            style={{ width: "100%", padding: 14, background: "#4ade80", color: "#000", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 900, cursor: "pointer" }}
          >
            ← Back to dashboard
          </button>
        </div>
      )}

      {view === "error-qr" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 22px" }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              marginBottom: 18,
              background: "#1a0a0a",
              border: "2px solid #b91c1c",
            }}
          >
            ❌
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 6, textAlign: "center" }}>
            Code expired
          </div>
          <div style={{ fontSize: 12, color: "#555", textAlign: "center", lineHeight: 1.6, marginBottom: 18 }}>
            QR code has expired, please refresh the tablet at reception and scan again.
          </div>
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: "13px 16px", width: "100%", marginBottom: 14 }}>
            <InfoRow label="Your code" value="Expired" valueColor="#f87171" />
            <InfoRow label="Required" value="A fresh scan" last />
          </div>
          <button
            onClick={reset}
            style={{ width: "100%", padding: 14, background: "#111", color: "#f87171", border: "1px solid #b91c1c", borderRadius: 14, fontSize: 15, fontWeight: 900, cursor: "pointer", marginBottom: 8 }}
          >
            Try again
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            style={{ width: "100%", padding: 14, background: "#4ade80", color: "#000", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 900, cursor: "pointer" }}
          >
            ← Back to dashboard
          </button>
        </div>
      )}

      {guideOpen && (
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "#0a0a0a",
            zIndex: 10,
            flexDirection: "column",
            padding: "20px 20px 16px",
            overflowY: "auto",
          }}
        >
          <div
            onClick={closeGuide}
            style={{
              alignSelf: "flex-end",
              color: "#4ade80",
              fontSize: 13,
              cursor: "pointer",
              marginBottom: 16,
              background: "#0d2818",
              border: "1px solid #1a3a22",
              padding: "5px 12px",
              borderRadius: 20,
            }}
          >
            ✕ Close
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 6 }}>How to check in</div>
          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: 18 }}>
            Every visit you log counts toward your monthly total and sets your price next month.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
            {GUIDE_STEPS.map((step, i) => (
              <div key={step.title} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#111", border: "1px solid #1a1a1a", borderRadius: 12, padding: 11 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "#4ade80",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#000",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "white", marginBottom: 2 }}>{step.title}</div>
                  <div style={{ fontSize: 11, color: "#555", lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#0d2818", border: "1px solid #1a3a22", borderRadius: 10, padding: 11, display: "flex", gap: 8 }}>
            <div style={{ fontSize: 16 }}>🔒</div>
            <div style={{ fontSize: 11, color: "#666", lineHeight: 1.5 }}>
              <strong style={{ color: "#4ade80" }}>Privacy:</strong> We only check your location when you tap check
              in. We never track you continuously or store your location history.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, padding: "10px 18px", justifyContent: "center", borderTop: "1px solid #111" }}>
        <span style={{ fontSize: 10, color: "#444", alignSelf: "center", marginRight: 4 }}>DEMO:</span>
        <button
          onClick={() => setView("success")}
          style={{ padding: "7px 12px", borderRadius: 20, border: "1.5px solid #1a3a22", background: "#0d2818", fontSize: 10, cursor: "pointer", fontWeight: 600, color: "#4ade80" }}
        >
          ✓ Success
        </button>
        <button
          onClick={() => setView("error-gps")}
          style={{ padding: "7px 12px", borderRadius: 20, border: "1.5px solid #7f1d1d", background: "#1a0a0a", fontSize: 10, cursor: "pointer", fontWeight: 600, color: "#f87171" }}
        >
          ✗ GPS fail
        </button>
        <button
          onClick={() => setView("error-qr")}
          style={{ padding: "7px 12px", borderRadius: 20, border: "1.5px solid #7f1d1d", background: "#1a0a0a", fontSize: 10, cursor: "pointer", fontWeight: 600, color: "#f87171" }}
        >
          ⏱ QR expired
        </button>
        <button
          onClick={reset}
          style={{ padding: "7px 12px", borderRadius: 20, border: "1.5px solid #333", background: "#111", fontSize: 10, cursor: "pointer", fontWeight: 600, color: "#666" }}
        >
          ↺ Reset
        </button>
      </div>
    </main>
  );
}

function InfoRow({
  label,
  value,
  green,
  valueColor,
  last,
}: {
  label: string;
  value: string;
  green?: boolean;
  valueColor?: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "5px 0",
        borderBottom: last ? "none" : "1px solid #1a1a1a",
        fontSize: 12,
      }}
    >
      <span style={{ color: "#444" }}>{label}</span>
      <span style={{ color: green ? "#4ade80" : valueColor ?? "white", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
