"use client";

import { useRef } from "react";
import Link from "next/link";

// Frontend only — matches the wireframe's static demo exactly (3 example
// rows always shown as a preview). No real CSV parsing or Supabase writes
// yet; "Choose file" opens a picker but nothing is processed from it.
const PREVIEW_ROWS = [
  { name: "Anna Meier", email: "anna@example.com" },
  { name: "Luca Bernasconi", email: "luca@example.com" },
  { name: "Sara Rossi", email: "sara@example.com" },
];

export default function ImportCsvPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <main className="app-shell flex flex-col" style={{ background: "#0a0a0a" }}>
      <div style={{ padding: "20px 18px 14px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #111" }}>
        <Link href="/admin" style={{ color: "#4ade80", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>
          ←
        </Link>
        <div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Import Members</div>
      </div>

      <div style={{ padding: 18, flex: 1, overflowY: "auto" }}>
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "white", marginBottom: 6 }}>What is this for?</div>
          <div style={{ fontSize: 11, color: "#555", lineHeight: 1.6 }}>
            Already have members in a spreadsheet or another system? Import them all at once here. GymFlex creates
            their accounts and sends each person an invite email automatically. You only need to do this once when
            setting up.
          </div>
        </div>

        <div style={{ border: "2px dashed #222", borderRadius: 18, padding: "28px 20px", textAlign: "center", marginBottom: 14, background: "#0d0d0d" }}>
          <div style={{ fontSize: 30, marginBottom: 6 }}>📄</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 4 }}>Upload your member CSV</div>
          <div style={{ fontSize: 11, color: "#444", marginBottom: 12 }}>
            Export from your current system and drop it here
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ display: "inline-block", padding: "8px 20px", background: "#4ade80", color: "#000", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none" }}
          >
            Choose file
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} />
        </div>

        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 8 }}>Required columns</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
            {["name", "email", "phone"].map((col) => (
              <div key={col} style={{ background: "#1a1a1a", color: "#888", fontSize: 9, padding: "5px 6px", borderRadius: 4, textAlign: "center", fontWeight: 600 }}>
                {col}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginTop: 4 }}>
            {["Anna Meier", "anna@...", "+41 79..."].map((cell) => (
              <div key={cell} style={{ background: "#111", color: "#444", fontSize: 9, padding: "5px 6px", borderRadius: 4, textAlign: "center", fontWeight: 400 }}>
                {cell}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#0d2818", border: "1px solid #1a3a22", borderRadius: 14, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#4ade80", marginBottom: 8 }}>
            ✓ Preview — {PREVIEW_ROWS.length} members ready to import
          </div>
          {PREVIEW_ROWS.map((row, i) => (
            <div
              key={row.email}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "#666",
                padding: "4px 0",
                borderBottom: i === PREVIEW_ROWS.length - 1 ? "none" : "1px solid #1a3a22",
              }}
            >
              <span>{row.name}</span>
              <span>{row.email}</span>
            </div>
          ))}
        </div>

        <button
          style={{ width: "100%", padding: 14, background: "#4ade80", color: "#000", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: "pointer" }}
        >
          Import {PREVIEW_ROWS.length} members &amp; send invites →
        </button>
      </div>
    </main>
  );
}
