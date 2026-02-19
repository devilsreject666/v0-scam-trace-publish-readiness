import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Aggregated stats for Money Tracker: total losses, top wallets, top domains, by type
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Fetch all reports
    const { data: reports, error } = await supabase
      .from('scam_reports')
      .select('loss_amount, loss_currency, wallet_addresses, domain, scam_type, created_at, status');

    if (error) {
      console.error('Stats query error:', error);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }

    if (!reports || reports.length === 0) {
      return res.status(200).json({
        totalLoss: 0,
        totalReports: 0,
        averageLoss: 0,
        topWallets: [],
        topDomains: [],
        byType: [],
        dailyLosses: [],
      });
    }

    // Convert all losses to USD (approximate)
    const toUsd = (amount: number, currency: string) => {
      if (!amount) return 0;
      switch (currency) {
        case 'EUR': return amount * 1.1;
        case 'GBP': return amount * 1.27;
        case 'BTC': return amount * 95000;
        case 'ETH': return amount * 3500;
        case 'USDT': case 'USDC': return amount;
        default: return amount;
      }
    };

    let totalLoss = 0;
    const walletMap = new Map<string, { loss: number; reports: number; chain: string }>();
    const domainMap = new Map<string, { loss: number; reports: number }>();
    const typeMap = new Map<string, { loss: number; count: number }>();
    const dailyMap = new Map<string, number>();

    for (const r of reports) {
      const usd = toUsd(r.loss_amount || 0, r.loss_currency || 'USD');
      totalLoss += usd;

      // Aggregate by wallet
      if (r.wallet_addresses && Array.isArray(r.wallet_addresses)) {
        for (const addr of r.wallet_addresses) {
          const existing = walletMap.get(addr) || { loss: 0, reports: 0, chain: addr.startsWith('0x') ? 'Ethereum' : 'Bitcoin' };
          existing.loss += usd;
          existing.reports += 1;
          walletMap.set(addr, existing);
        }
      }

      // Aggregate by domain
      if (r.domain) {
        const existing = domainMap.get(r.domain) || { loss: 0, reports: 0 };
        existing.loss += usd;
        existing.reports += 1;
        domainMap.set(r.domain, existing);
      }

      // Aggregate by type
      if (r.scam_type) {
        const existing = typeMap.get(r.scam_type) || { loss: 0, count: 0 };
        existing.loss += usd;
        existing.count += 1;
        typeMap.set(r.scam_type, existing);
      }

      // Aggregate daily
      const day = new Date(r.created_at).toISOString().split('T')[0];
      dailyMap.set(day, (dailyMap.get(day) || 0) + usd);
    }

    // Sort and limit
    const topWallets = Array.from(walletMap.entries())
      .map(([addr, data]) => ({ address: addr, ...data }))
      .sort((a, b) => b.loss - a.loss)
      .slice(0, 10);

    const topDomains = Array.from(domainMap.entries())
      .map(([domain, data]) => ({ domain, ...data }))
      .sort((a, b) => b.loss - a.loss)
      .slice(0, 10);

    const byType = Array.from(typeMap.entries())
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.loss - a.loss);

    // Last 30 days daily
    const dailyLosses = Array.from(dailyMap.entries())
      .map(([date, loss]) => ({ date, loss }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    return res.status(200).json({
      totalLoss,
      totalReports: reports.length,
      averageLoss: reports.length > 0 ? totalLoss / reports.length : 0,
      topWallets,
      topDomains,
      byType,
      dailyLosses,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
