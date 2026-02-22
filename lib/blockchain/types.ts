export interface RiskIndicator {
  severity: "low" | "medium" | "high" | "critical";
  label: string;
  description: string;
}

export interface ScanResult {
  address: string;
  chain: "eth" | "btc";
  balance?: string;
  txCount?: number;
  firstSeen?: string;
  lastSeen?: string;
  riskIndicators: RiskIndicator[];
  riskScore: number | null; // 0-100, null if insufficient data
  raw?: Record<string, unknown>;
}

export interface BlockchainProvider {
  name: string;
  supportedChains: string[];
  scanAddress(address: string, chain: "eth" | "btc"): Promise<ScanResult>;
}
