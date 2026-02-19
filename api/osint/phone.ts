import type { VercelRequest, VercelResponse } from '@vercel/node';

// Real phone number lookup using numverify (free tier) + our DB
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone } = req.body;
  if (!phone || typeof phone !== 'string') return res.status(400).json({ error: 'phone is required' });

  // Strip non-numeric except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  const digits = cleaned.replace(/^\+/, '');

  try {
    // numverify free API (HTTP only on free tier)
    const numverifyKey = process.env.NUMVERIFY_API_KEY;
    let numverifyData: Record<string, unknown> = {};

    if (numverifyKey) {
      const nvRes = await fetch(
        `http://apilayer.net/api/validate?access_key=${numverifyKey}&number=${digits}&country_code=&format=1`
      ).catch(() => null);
      if (nvRes && nvRes.ok) {
        numverifyData = await nvRes.json();
      }
    }

    // Fallback: use basic country code detection
    const countryCode = detectCountryFromPhone(cleaned);

    const valid = (numverifyData as { valid?: boolean }).valid ?? digits.length >= 10;
    const carrier = (numverifyData as { carrier?: string }).carrier || 'Unknown';
    const lineType = (numverifyData as { line_type?: string }).line_type || 'Unknown';
    const country = (numverifyData as { country_name?: string }).country_name || countryCode.country;
    const location = (numverifyData as { location?: string }).location || '';

    // Determine VoIP status
    const isVoip = lineType === 'voip' ||
      carrier.toLowerCase().includes('textnow') ||
      carrier.toLowerCase().includes('google voice') ||
      carrier.toLowerCase().includes('twilio') ||
      carrier.toLowerCase().includes('bandwidth') ||
      carrier.toLowerCase().includes('vonage');

    // Build risk flags
    const flags: string[] = [];
    let riskScore = 0;

    if (isVoip) {
      flags.push('VoIP number -- commonly used for disposable fraud communications');
      riskScore += 25;
    }

    const voipCarriers = ['textnow', 'google voice', 'talkatone', 'textfree', 'pinger', 'burner'];
    if (voipCarriers.some(c => carrier.toLowerCase().includes(c))) {
      flags.push(`${carrier} -- free VoIP service, no identity verification required`);
      riskScore += 20;
    }

    if (lineType === 'prepaid') {
      flags.push('Prepaid number -- often used with minimal identity verification');
      riskScore += 10;
    }

    if (!valid) {
      flags.push('Number validation failed -- may be spoofed or invalid');
      riskScore += 30;
    }

    riskScore = Math.min(100, Math.max(0, riskScore));

    const result = {
      number: phone,
      carrier: carrier || 'Unknown',
      type: isVoip ? 'VoIP / Virtual' : lineType || 'Unknown',
      country,
      region: location || 'Unknown',
      city: '',
      timezone: countryCode.timezone,
      isVoip,
      isPrepaid: lineType === 'prepaid',
      riskScore,
      scamReports: 0, // enriched from Supabase on frontend
      flags,
      recentActivity: [],
      linkedPlatforms: [],
      valid,
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error('Phone OSINT error:', err);
    return res.status(500).json({ error: 'Failed to lookup phone number' });
  }
}

function detectCountryFromPhone(phone: string): { country: string; timezone: string } {
  if (phone.startsWith('+1') || phone.startsWith('1')) return { country: 'United States/Canada', timezone: 'America/New_York' };
  if (phone.startsWith('+44')) return { country: 'United Kingdom', timezone: 'Europe/London' };
  if (phone.startsWith('+91')) return { country: 'India', timezone: 'Asia/Kolkata' };
  if (phone.startsWith('+86')) return { country: 'China', timezone: 'Asia/Shanghai' };
  if (phone.startsWith('+234')) return { country: 'Nigeria', timezone: 'Africa/Lagos' };
  if (phone.startsWith('+7')) return { country: 'Russia', timezone: 'Europe/Moscow' };
  if (phone.startsWith('+49')) return { country: 'Germany', timezone: 'Europe/Berlin' };
  if (phone.startsWith('+33')) return { country: 'France', timezone: 'Europe/Paris' };
  if (phone.startsWith('+81')) return { country: 'Japan', timezone: 'Asia/Tokyo' };
  if (phone.startsWith('+61')) return { country: 'Australia', timezone: 'Australia/Sydney' };
  if (phone.startsWith('+55')) return { country: 'Brazil', timezone: 'America/Sao_Paulo' };
  if (phone.startsWith('+52')) return { country: 'Mexico', timezone: 'America/Mexico_City' };
  return { country: 'Unknown', timezone: 'UTC' };
}
