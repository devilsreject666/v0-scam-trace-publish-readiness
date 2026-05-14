import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { address } = req.query;
  if (!address || typeof address !== "string") {
    return res.status(400).json({ error: "Missing address parameter" });
  }

  const addr = address.trim();
  const btcPattern = /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/;
  const ethPattern = /^0x[a-fA-F0-9]{40}$/;

  let chain: string | null = null;
  if (btcPattern.test(addr)) chain = "bitcoin";
  else if (ethPattern.test(addr)) chain = "ethereum";

  if (!chain) {
    return res.status(400).json({ error: "Invalid BTC or ETH address format" });
  }

  try {
    const response = await fetch(
      `https://api.blockchair.com/${chain}/dashboards/address/${addr}?limit=5`
    );
    if (!response.ok) {
      throw new Error(`Blockchair API error: ${response.status}`);
    }
    const data = await response.json();
    const addressData = data.data?.[addr] || data.data?.[addr.toLowerCase()];

    if (!addressData) {
      return res.status(404).json({ error: "Address not found on blockchain" });
    }

    const props = addressData.address;
    const txs = addressData.transactions || [];
    const balance = chain === "bitcoin"
      ? (props.balance || 0) / 1e8
      : (props.balance || 0) / 1e18;
    const totalReceived = chain === "bitcoin"
      ? (props.received || 0) / 1e8
      : (props.received || 0) / 1e18;
    const totalSent = chain === "bitcoin"
      ? (props.spent || 0) / 1e8
      : (props.spent || 0) / 1e18;
    const txCount = props.transaction_count || 0;
    const firstSeen = props.first_seen_receiving || null;
    const lastSeen = props.last_seen_receiving || null;

    const { score: riskScore, level: riskLevel } = calculateRisk(txCount, balance);

    const recentTxs = txs.slice(0, 5).map((txHash: string) => ({
      hash: txHash,
      url: chain === "bitcoin"
        ? `https://blockchair.com/bitcoin/transaction/${txHash}`
        : `https://blockchair.com/ethereum/transaction/${txHash}`,
    }));

    return res.status(200).json({
      chain,
      address: addr,
      balance: parseFloat(balance.toFixed(8)),
      txCount,
      totalReceived: parseFloat(totalReceived.toFixed(8)),
      totalSent: parseFloat(totalSent.toFixed(8)),
      firstSeen,
      lastSeen,
      riskScore,
      riskLevel,
      recentTxs,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

function calculateRisk(
  txCount: number,
  balance: number
): { score: number; level: string } {
  let score = 0;
  if (txCount > 1000) score += 40;
  else if (txCount > 100) score += 20;
  else if (txCount < 3) score += 15;

  if (balance > 100) score += 30;
  else if (balance > 10) score += 10;

  if (txCount > 500 && balance < 0.001) score += 30;

  const level = score >= 60 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW";
  return { score: Math.min(score, 100), level };
}
