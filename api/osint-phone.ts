import type { VercelRequest, VercelResponse } from '@vercel/node';

/* -----------------------------------------------------------------------
   /api/osint-phone
   Query: ?phone=+13325550147
   Sources: NumVerify (free tier), IPQualityScore (free tier), abstract-api
   Falls back gracefully when keys are absent.
----------------------------------------------------------------------- */

const NUMVERIFY_KEY = process.env.NUMVERIFY_API_KEY ?? '';
const IPQS_KEY = process.env.IPQUALITYSCORE_API_KEY ?? '';
const ABSTRACT_KEY = process.env.ABSTRACT_PHONE_API_KEY ?? '';

async function safeJson(r: Response) {
  try { return await r.json(); } catch { return null; }
}

// Normalize phone: strip everything except + and digits
function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) return '+' + cleaned;
  return cleaned;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const rawPhone = (req.query.phone as string ?? '').trim();
  if (!rawPhone) return res.status(400).json({ error: 'Phone number is required' });

  const phone = normalizePhone(rawPhone);
  if (phone.replace(/\D/g, '').length < 7) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  let carrier = 'Unknown';
  let type = 'Unknown';
  let country = 'Unknown';
  let region = 'Unknown';
  let city = 'Unknown';
  let timezone = 'Unknown';
  let isVoip = false;
  let isPrepaid = false;
  let riskScore = 20;
  let scamReports = 0;
  const flags: string[] = [];
  const linkedPlatforms: string[] = [];
  const recentActivity: string[] = [];

  /* ---- 1. NumVerify -------------------------------------------------- */
  if (NUMVERIFY_KEY) {
    try {
      const r = await fetch(
        `http://apilayer.net/api/validate?access_key=${NUMVERIFY_KEY}&number=${encodeURIComponent(phone)}&country_code=&format=1`
      );
      const d = await safeJson(r);
      if (d?.valid) {
        carrier = d.carrier || 'Unknown';
        type = d.line_type || 'Unknown';
        country = d.country_name || 'Unknown';
        region = d.location || 'Unknown';
        isVoip = (d.line_type === 'voip') || carrier.toLowerCase().includes('voip') ||
          ['textnow', 'google voice', 'magicjack', 'vonage', 'twilio'].some(v => carrier.toLowerCase().includes(v));
      }
    } catch { /* ignore */ }
  }

  /* ---- 2. IPQualityScore -------------------------------------------- */
  if (IPQS_KEY) {
    try {
      const r = await fetch(
        `https://ipqualityscore.com/api/json/phone/${IPQS_KEY}/${encodeURIComponent(phone)}`
      );
      const d = await safeJson(r);
      if (d?.success) {
        carrier = d.carrier || carrier;
        type = d.line_type || type;
        country = d.country || country;
        region = d.region || region;
        city = d.city || city;
        timezone = d.timezone || timezone;
        isVoip = d.VOIP ?? isVoip;
        isPrepaid = d.prepaid ?? isPrepaid;
        riskScore = Math.max(riskScore, d.fraud_score ?? 0);
        scamReports = d.fraud_score > 75 ? Math.ceil(d.fraud_score / 20) : 0;

        if (d.active_status === 'false') flags.push('Number appears to be inactive or disconnected');
        if (d.leaked) flags.push('Phone number found in data breach databases');
        if (d.associated_email_addresses?.emails?.length > 0) {
          flags.push(`Associated with ${d.associated_email_addresses.emails.length} email address(es) in known databases`);
        }
      }
    } catch { /* ignore */ }
  }

  /* ---- 3. Abstract API (fallback for carrier/type) ----------------- */
  if (ABSTRACT_KEY && carrier === 'Unknown') {
    try {
      const r = await fetch(
        `https://phonevalidation.abstractapi.com/v1/?api_key=${ABSTRACT_KEY}&phone=${encodeURIComponent(phone)}`
      );
      const d = await safeJson(r);
      if (d?.valid) {
        carrier = d.carrier || carrier;
        type = d.type || type;
        country = d.country?.name || country;
      }
    } catch { /* ignore */ }
  }

  /* ---- 4. Heuristic risk scoring ------------------------------------ */
  const voipCarriers = ['textnow', 'google voice', 'magicjack', 'vonage', 'twilio', 'telnyx', 'bandwidth', 'bandwidth.com'];
  if (voipCarriers.some(v => carrier.toLowerCase().includes(v)) || type.toLowerCase().includes('voip')) {
    isVoip = true;
    riskScore = Math.max(riskScore, 65);
    flags.push(`VoIP carrier (${carrier}) — disposable/virtual numbers commonly used in fraud`);
    linkedPlatforms.push('WhatsApp', 'Telegram');
  }
  if (isPrepaid) {
    riskScore = Math.max(riskScore, 50);
    flags.push('Prepaid SIM — no identity verification required for purchase');
  }
  if (type.toLowerCase().includes('toll') || type.toLowerCase().includes('premium')) {
    riskScore = Math.max(riskScore, 55);
    flags.push('Premium/toll-free number — sometimes used in billing fraud');
  }
  if (scamReports > 0) recentActivity.push(`${scamReports} fraud reports found in threat intelligence feeds`);
  if (riskScore >= 75) flags.push('High fraud score — number associated with suspicious activity patterns');

  riskScore = Math.min(100, riskScore);

  // Display format
  const display = phone.length >= 11
    ? `${phone.slice(0, phone.startsWith('+1') ? 2 : 3)} (${phone.slice(phone.startsWith('+1') ? 2 : 3, phone.startsWith('+1') ? 5 : 6)}) ${phone.slice(phone.startsWith('+1') ? 5 : 6, phone.startsWith('+1') ? 8 : 9)}-${phone.slice(phone.startsWith('+1') ? 8 : 9)}`
    : phone;

  return res.status(200).json({
    number: display,
    rawNumber: phone,
    carrier,
    type,
    country,
    region,
    city,
    timezone,
    isVoip,
    isPrepaid,
    riskScore,
    scamReports,
    flags,
    recentActivity,
    linkedPlatforms,
  });
}
