import type { BlockchainProvider, ScanResult } from "./types";
import { EtherscanProvider } from "./etherscan";
import { BlockstreamProvider } from "./blockstream";

export type { ScanResult, RiskIndicator, BlockchainProvider } from "./types";

const providers: BlockchainProvider[] = [
  new EtherscanProvider(),
  new BlockstreamProvider(),
];

/**
 * Register additional providers at runtime (e.g., Chainalysis, Elliptic, TRM Labs)
 */
export function registerProvider(provider: BlockchainProvider) {
  providers.push(provider);
}

/**
 * Detect chain from address format
 */
export function detectChain(address: string): "eth" | "btc" | null {
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return "eth";
  if (/^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address)) return "btc";
  return null;
}

/**
 * Scan an address using the appropriate provider
 */
export async function scanAddress(
  address: string,
  chain?: "eth" | "btc"
): Promise<ScanResult> {
  const detectedChain = chain || detectChain(address);

  if (!detectedChain) {
    return {
      address,
      chain: "eth",
      riskIndicators: [],
      riskScore: null,
    };
  }

  const provider = providers.find((p) =>
    p.supportedChains.includes(detectedChain)
  );

  if (!provider) {
    return {
      address,
      chain: detectedChain,
      riskIndicators: [],
      riskScore: null,
    };
  }

  return provider.scanAddress(address, detectedChain);
}
