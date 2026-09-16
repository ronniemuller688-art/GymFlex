const GYM_NAME = "FitZone Zürich";

// Deterministic pseudo-random pattern so server and client render the same
// grid without needing client-side state — this is a static placeholder,
// not a real rotating QR code yet.
function QrGrid() {
  const cells = Array.from({ length: 64 }, (_, i) => (i * 37) % 100 > 45);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(8,1fr)",
        gap: 2,
        padding: 18,
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

export default function TabletPage() {
  return (
    <main
      className="app-shell flex flex-col items-center justify-center"
      style={{ background: "#0a0a0a", padding: 24 }}
    >
      <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
        Reception display
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 4, textAlign: "center" }}>
        {GYM_NAME}
      </div>
      <div style={{ fontSize: 12, color: "#444", marginBottom: 28, textAlign: "center" }}>
        Open GymFlex on your phone and scan to check in
      </div>

      <div
        style={{
          width: 200,
          height: 200,
          background: "#111",
          border: "2px solid #1a3a22",
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
        <QrGrid />
        <div style={{ position: "absolute", width: 30, height: 30, top: 14, left: 14, border: "3px solid #4ade80", borderRadius: 4, borderRight: "none", borderBottom: "none" }} />
        <div style={{ position: "absolute", width: 30, height: 30, top: 14, right: 14, border: "3px solid #4ade80", borderRadius: 4, borderLeft: "none", borderBottom: "none" }} />
        <div style={{ position: "absolute", width: 30, height: 30, bottom: 14, left: 14, border: "3px solid #4ade80", borderRadius: 4, borderRight: "none", borderTop: "none" }} />
      </div>

      <div style={{ fontSize: 14, color: "#888", textAlign: "center", marginBottom: 8 }}>
        <strong style={{ color: "white" }}>Scan this QR</strong> with GymFlex to check in
      </div>

      <div
        style={{
          background: "#111",
          border: "1px solid #1a1a1a",
          borderRadius: 12,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 16, flexShrink: 0 }}>🕐</div>
        <div style={{ fontSize: 12, color: "#555", flex: 1, whiteSpace: "nowrap" }}>
          Code refreshes in <span style={{ color: "#f97316", fontWeight: 700 }}>43 min</span>
        </div>
        <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2, flex: 1 }}>
          <div style={{ height: 3, background: "#f97316", borderRadius: 2, width: "55%" }} />
        </div>
      </div>

      <div style={{ fontSize: 10, color: "#333", textAlign: "center" }}>
        Powered by <span style={{ color: "#444" }}>GymFlex</span> · gymflex.io
      </div>
    </main>
  );
}
