export const PLANS = {
  free: { scans: 3 },
  starter: { scans: 25 },
  pro: { scans: Infinity },
  investigator: { scans: Infinity },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getScansRemaining(
  plan: PlanKey,
  scanCountMonth: number
): number | null {
  const limit = PLANS[plan].scans;
  if (limit === Infinity) return null; // unlimited
  return Math.max(0, limit - scanCountMonth);
}

export function canScan(plan: PlanKey, scanCountMonth: number): boolean {
  const limit = PLANS[plan].scans;
  if (limit === Infinity) return true;
  return scanCountMonth < limit;
}
