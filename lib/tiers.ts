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
