export type Tier = {
  name: "Starter" | "Regular" | "Active" | "Committed" | "Champion";
  minVisits: number;
  maxVisits: number | null;
  priceChf: number;
  colour: string;
  bg: string;
  text: string;
};

export const TIERS: Tier[] = [
  {
    name: "Starter",
    minVisits: 0,
    maxVisits: 2,
    priceChf: 129,
    colour: "#dc2626",
    bg: "#2a0a0a",
    text: "#f87171",
  },
  {
    name: "Regular",
    minVisits: 3,
    maxVisits: 7,
    priceChf: 109,
    colour: "#ea580c",
    bg: "#2a1200",
    text: "#fb923c",
  },
  {
    name: "Active",
    minVisits: 8,
    maxVisits: 12,
    priceChf: 89,
    colour: "#d97706",
    bg: "#2a1e00",
    text: "#fbbf24",
  },
  {
    name: "Committed",
    minVisits: 13,
    maxVisits: 19,
    priceChf: 69,
    colour: "#2563eb",
    bg: "#0f1e4a",
    text: "#93c5fd",
  },
  {
    name: "Champion",
    minVisits: 20,
    maxVisits: null,
    priceChf: 49,
    colour: "#ca8a04",
    bg: "#2a1f00",
    text: "#fde047",
  },
];

export function getTierForVisits(visits: number): Tier {
  const tier = TIERS.find(
    (t) => visits >= t.minVisits && (t.maxVisits === null || visits <= t.maxVisits)
  );
  return tier ?? TIERS[TIERS.length - 1];
}

export function getNextTier(currentTier: Tier): Tier | null {
  const index = TIERS.findIndex((t) => t.name === currentTier.name);
  if (index === -1 || index === TIERS.length - 1) return null;
  return TIERS[index + 1];
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: number[]): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
}

// Derived from the wireframe's Active-tier dashboard card: gradient start is
// tier.bg shifted by (-12,-10,0), border is tier.bg shifted by (+16,+10,0).
// Reproduces the wireframe exactly for Active and generalises for other tiers.
export function tierCardGradientFrom(tier: Tier): string {
  const [r, g, b] = hexToRgb(tier.bg);
  return rgbToHex([r - 12, g - 10, b]);
}

export function tierCardBorder(tier: Tier): string {
  const [r, g, b] = hexToRgb(tier.bg);
  return rgbToHex([r + 16, g + 10, b]);
}

// Darken tier.colour toward black by `amount` (0-1) — used for the
// check-in button's label/sub text, which sit on a tier.colour background.
export function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const k = 1 - amount;
  return rgbToHex([r * k, g * k, b * k]);
}
