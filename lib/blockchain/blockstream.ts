import type { BlockchainProvider, ScanResult, RiskIndicator } from "./types";

const BLOCKSTREAM_API = "https://blockstream.info/api";

export class BlockstreamProvider implements BlockchainProvider {
  name = "blockstream";
  supportedChains = ["btc"];

  async scanAddress(address: string): Promise<ScanResult> {
    const indicators: RiskIndicator[] = [];

    try {
      const res = await fetch(`${BLOCKSTREAM_API}/address/${address}`);
      if (!res.ok) throw new Error("Blockstream API error");
      const data = await res.json();

      const funded = data.chain_stats?.funded_txo_sum || 0;
      const spent = data.chain_stats?.spent_txo_sum || 0;
      const balance = (funded - spent) / 1e8;
      const txCount =
        (data.chain_stats?.tx_count || 0) +
        (data.mempool_stats?.tx_count || 0);

      // Try to get recent transactions for timing analysis
      const txRes = await fetch(
        `${BLOCKSTREAM_API}/address/${address}/txs`
      );
      const txList = txRes.ok ? await txRes.json() : [];

      if (Array.isArray(txList) && txList.length > 0) {
        const confirmedTxs = txList.filter(
          (tx: { status?: { confirmed?: boolean } }) => tx.status?.confirmed
        );
        if (confirmedTxs.length > 0) {
          const newest = confirmedTxs[0];
          const oldest = confirmedTxs[confirmedTxs.length - 1];

          if (newest.status?.block_time && oldest.status?.block_time) {
            const daysSinceFirst =
              (Date.now() / 1000 - oldest.status.block_time) / 86400;

            if (daysSinceFirst < 30) {
              indicators.push({
                severity: "high",
                label: "Newly Created Wallet",
                description: `First seen ${Math.floor(daysSinceFirst)} days ago`,
              });
            }
          }
        }
      }

      if (balance === 0 && txCount > 5) {
        indicators.push({
          severity: "high",
          label: "Drained Wallet",
          description:
            "Zero balance with significant transaction history",
        });
      }

      if (txCount > 100) {
        indicators.push({
          severity: "medium",
          label: "High Volume Address",
          description: `${txCount} total transactions detected`,
        });
      }

      const riskScore =
        indicators.length === 0
          ? null
          : Math.min(
              100,
              indicators.reduce((sum, i) => {
                const weights = {
                  low: 10,
                  medium: 25,
                  high: 40,
                  critical: 60,
                };
                return sum + weights[i.severity];
              }, 0)
            );

      return {
        address,
        chain: "btc",
        balance: `${balance.toFixed(8)} BTC`,
        txCount,
        riskIndicators: indicators,
        riskScore,
      };
    } catch {
      return {
        address,
        chain: "btc",
        riskIndicators: [],
        riskScore: null,
      };
    }
  }
}
