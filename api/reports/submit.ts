import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    scamType, url, description, timeline, lossAmount, lossCurrency,
    walletAddresses, phoneNumbers, emails, usernames, platform, country,
    userId, caseId,
  } = req.body;

  if (!scamType || !description) {
    return res.status(400).json({ error: 'scamType and description are required' });
  }

  try {
    // Parse comma/newline-separated fields into arrays
    const parseList = (s: string) => s ? s.split(/[,\n]+/).map((v: string) => v.trim()).filter(Boolean) : [];

    // Extract domain from URL
    let domain = '';
    if (url) {
      try { domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname; }
      catch { domain = url; }
    }

    const reportData = {
      scam_type: scamType,
      url: url || null,
      domain: domain || null,
      description,
      timeline: timeline || null,
      loss_amount: lossAmount ? parseFloat(lossAmount) : null,
      loss_currency: lossCurrency || 'USD',
      wallet_addresses: parseList(walletAddresses),
      phone_numbers: parseList(phoneNumbers),
      emails: parseList(emails),
      usernames: parseList(usernames),
      platform: platform || null,
      country: country || null,
      user_id: userId || null,
      case_id: caseId || null,
      status: 'pending',
      severity: calculateSeverity(parseFloat(lossAmount || '0'), lossCurrency || 'USD'),
    };

    const { data, error } = await supabase
      .from('scam_reports')
      .insert(reportData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save report' });
    }

    // If user is authenticated and no existing case, create one
    if (userId && !caseId) {
      const { data: caseData } = await supabase
        .from('cases')
        .insert({
          user_id: userId,
          title: `${scamType} Report`,
          description: description.substring(0, 200),
          status: 'open',
          scam_type: scamType,
          total_loss: lossAmount ? parseFloat(lossAmount) : 0,
          currency: lossCurrency || 'USD',
        })
        .select('id')
        .single();

      if (caseData) {
        // Link report to case
        await supabase
          .from('scam_reports')
          .update({ case_id: caseData.id })
          .eq('id', data.id);

        return res.status(200).json({
          report: data,
          caseId: caseData.id,
          message: 'Report submitted and case created successfully',
        });
      }
    }

    return res.status(200).json({
      report: data,
      message: 'Report submitted successfully',
    });
  } catch (err) {
    console.error('Report submission error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function calculateSeverity(amount: number, currency: string): string {
  // Convert to approx USD
  const usd = currency === 'USD' ? amount
    : currency === 'EUR' ? amount * 1.1
    : currency === 'GBP' ? amount * 1.27
    : currency === 'BTC' ? amount * 95000
    : currency === 'ETH' ? amount * 3500
    : amount;

  if (usd >= 100000) return 'critical';
  if (usd >= 10000) return 'high';
  if (usd >= 1000) return 'medium';
  return 'low';
}
