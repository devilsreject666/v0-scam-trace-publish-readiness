import type { BlockchainProvider, ScanResult, RiskIndicator } from "./types";

const ETHERSCAN_API = "https://api.etherscan.io/api";

export class EtherscanProvider implements BlockchainProvider {
  name = "etherscan";
  supportedChains = ["eth"];

  async scanAddress(address: string): Promise<ScanResult> {
    const apiKey = process.env.ETHERSCAN_API_KEY || "";
    const indicators: RiskIndicator[] = [];

    try {
      // Fetch balance and transactions in parallel
      const [balanceRes, txRes] = await Promise.all([
        fetch(
          `${ETHERSCAN_API}?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
        ),
        fetch(
          `${ETHERSCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${apiKey}`
        ),
      ]);

      const balanceData = await balanceRes.json();
      const txData = await txRes.json();

      const balanceWei = balanceData.result || "0";
      const balanceEth = (parseInt(balanceWei) / 1e18).toFixed(4);
      const txList = Array.isArray(txData.result) ? txData.result : [];

      // Analyze risk indicators
      if (txList.length > 0) {
        const firstTx = txList[txList.length - 1];
        const firstDate = new Date(parseInt(firstTx.timeStamp) * 1000);
        const daysSinceCreation =
          (Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceCreation < 30) {
          indicators.push({
            severity: "high",
            label: "Newly Created Wallet",
            description: `Wallet is only ${Math.floor(daysSinceCreation)} days old`,
          });
        }

        // High transaction velocity
        if (txList.length >= 50) {
          const lastTx = txList[0];
          const hourSpan =
            (parseInt(lastTx.timeStamp) - parseInt(firstTx.timeStamp)) / 3600;
          if (hourSpan > 0 && txList.length / hourSpan > 2) {
            indicators.push({
              severity: "medium",
              label: "High Transaction Velocity",
              description: `${txList.length} transactions in a short period`,
            });
          }
        }

        // Check for zero balance with recent activity (fund drain)
        if (parseFloat(balanceEth) === 0 && txList.length > 5) {
          indicators.push({
            severity: "high",
            label: "Drained Wallet",
            description:
              "Wallet has zero balance despite significant transaction history",
          });
        }
      }

      const riskScore =
        indicators.length === 0
          ? null
          : Math.min(
              100,
              indicators.reduce((sum, i) => {
                const weights = { low: 10, medium: 25, high: 40, critical: 60 };
                return sum + weights[i.severity];
              }, 0)
            );

      return {
        address,
        chain: "eth",
        balance: `${balanceEth} ETH`,
        txCount: txList.length,
        firstSeen:
          txList.length > 0
            ? new Date(
                parseInt(txList[txList.length - 1].timeStamp) * 1000
              ).toISOString()
            : undefined,
        lastSeen:
          txList.length > 0
            ? new Date(
                parseInt(txList[0].timeStamp) * 1000
              ).toISOString()
            : undefined,
        riskIndicators: indicators,
        riskScore,
      };
    } catch {
      return {
        address,
        chain: "eth",
        riskIndicators: [],
        riskScore: null,
      };
    }
  }
}
