import type { Lead } from "./leads-mock";

export type LeadType = "Free Class" | "PCTH Program" | "Franchise" | "Lead";
export type LeadStage =
  | "New Purchase" | "Repeat Purchase" | "Not Buying" | "Stopped"
  | "Not Learned" | "Learned" | "—";
export type LeadTier = "Gold" | "Silver" | "Bronze" | null;

export function computeType(tags: string[]): LeadType {
  if (tags.includes("mien_phi_online") || tags.includes("mien_phi_offline")) return "Free Class";
  if (tags.includes("pcth") || tags.includes("van_hanh") || tags.includes("mkt") || tags.includes("lop_khac")) return "PCTH Program";
  if (tags.includes("nhuong_quyen")) return "Franchise";
  return "Lead";
}

const STAGE_MAP: Record<string, LeadStage> = {
  mua_lan_dau: "New Purchase",
  mua_lai: "Repeat Purchase",
  khong_mua: "Not Buying",
  ngung_mua: "Stopped",
  chua_hoc: "Not Learned",
  da_hoc: "Learned",
};
// Priority order for stage display (purchase > learn)
const STAGE_ORDER = ["mua_lan_dau", "mua_lai", "khong_mua", "ngung_mua", "da_hoc", "chua_hoc"];

export function computeStage(tags: string[]): LeadStage {
  for (const k of STAGE_ORDER) if (tags.includes(k)) return STAGE_MAP[k];
  return "—";
}

export function computeTier(tags: string[]): LeadTier {
  if (tags.includes("vang")) return "Gold";
  if (tags.includes("bac")) return "Silver";
  if (tags.includes("dong")) return "Bronze";
  return null;
}

export function computePriorityHigh(tags: string[]): boolean {
  return tags.includes("vang") && (tags.includes("mua_lai") || tags.includes("pcth"));
}

export function computeStale(last_touch: string): boolean {
  const diff = Date.now() - new Date(last_touch).getTime();
  return diff > 7 * 24 * 60 * 60 * 1000;
}

export function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

export type Derived = {
  type: LeadType;
  stage: LeadStage;
  tier: LeadTier;
  high: boolean;
  stale: boolean;
};

export function derive(lead: Lead): Derived {
  return {
    type: computeType(lead.tags),
    stage: computeStage(lead.tags),
    tier: computeTier(lead.tags),
    high: computePriorityHigh(lead.tags),
    stale: computeStale(lead.last_touch),
  };
}
