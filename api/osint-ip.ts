import type { VercelRequest, VercelResponse } from '@vercel/node';

/* -----------------------------------------------------------------------
   /api/osint-ip
   Query: ?ip=1.2.3.4
   Sources: AbuseIPDB, IPinfo, ip-api (fallback)
----------------------------------------------------------------------- */

const ABUSEIPDB_KEY = process.env.ABUSEIPDB_API_KEY ?? '';
const IPINFO_TOKEN = process.env.IPINFO_TOKEN ?? '';

async function safeJson(r: Response) {
  try { return await r.json(); } catch { return null; }
}

function isValidIp(ip: string) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) || /^[0-9a-fA-F:]{3,39}$/.test(ip);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const ip = (req.query.ip as string ?? '').trim();
  if (!ip || !isValidIp(ip)) return res.status(400).json({ error: 'Invalid IP address' });

  let country = 'Unknown', region = 'Unknown', city = 'Unknown';
  let isp = 'Unknown', org = 'Unknown', asn = 'Unknown';
  let lat = 0, lng = 0;
  let isVpn = false, isProxy = false, isTor = false, isHosting = false;
  let riskScore = 10;
  let abuseReports = 0;
  const flags: string[] = [];

  /* ---- 1. IPinfo ----------------------------------------------------- */
  if (IPINFO_TOKEN) {
    try {
      const r = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`);
      const d = await safeJson(r);
      if (d && !d.error) {
        country = d.country ?? 'Unknown';
        region = d.region ?? 'Unknown';
        city = d.city ?? 'Unknown';
        org = d.org ?? 'Unknown';
        asn = d.asn?.asn ?? d.org?.split(' ')[0] ?? 'Unknown';
        isp = d.company?.name ?? d.org?.replace(/^AS\d+ /, '') ?? 'Unknown';
        if (d.privacy) {
          isVpn = d.privacy.vpn ?? false;
          isProxy = d.privacy.proxy ?? false;
          isTor = d.privacy.tor ?? false;
          isHosting = d.privacy.hosting ?? false;
        }
        if (d.loc) {
          const parts = d.loc.split(',');
          lat = parseFloat(parts[0]) || 0;
          lng = parseFloat(parts[1]) || 0;
        }
      }
    } catch { /* ignore */ }
  } else {
    // Free fallback: ip-api
    try {
      const r = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,org,as,lat,lon,proxy,hosting`);
      const d = await safeJson(r);
      if (d?.status === 'success') {
        country = d.country ?? 'Unknown';
        region = d.regionName ?? 'Unknown';
        city = d.city ?? 'Unknown';
        isp = d.isp ?? 'Unknown';
        org = d.org ?? 'Unknown';
        asn = d.as?.split(' ')[0] ?? 'Unknown';
        lat = d.lat ?? 0;
        lng = d.lon ?? 0;
        isProxy = d.proxy ?? false;
        isHosting = d.hosting ?? false;
      }
    } catch { /* ignore */ }
  }

  /* ---- 2. AbuseIPDB -------------------------------------------------- */
  if (ABUSEIPDB_KEY) {
    try {
      const r = await fetch(
        `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`,
        { headers: { Key: ABUSEIPDB_KEY, Accept: 'application/json' } }
      );
      const d = await safeJson(r);
      if (d?.data) {
        abuseReports = d.data.totalReports ?? 0;
        const confidence = d.data.abuseConfidenceScore ?? 0;
        riskScore = Math.max(riskScore, confidence);
        isTor = isTor || d.data.isTor;
        if (d.data.domain) isp = d.data.isp ?? isp;
        if (abuseReports > 0) flags.push(`${abuseReports} abuse reports in the last 90 days (AbuseIPDB confidence: ${confidence}%)`);
        if (d.data.usageType === 'Data Center/Web Hosting/Transit') { isHosting = true; flags.push('Data center / hosting IP — not a residential address'); }
        if (d.data.usageType?.toLowerCase().includes('tor')) { isTor = true; }
      }
    } catch { /* ignore */ }
  }

  /* ---- 3. Risk heuristics ------------------------------------------- */
  if (isTor) { riskScore = Math.max(riskScore, 80); flags.push('Tor exit node detected — traffic is anonymized through the Tor network'); }
  if (isVpn) { riskScore = Math.max(riskScore, 50); flags.push('VPN service detected — IP is associated with a VPN provider'); }
  if (isProxy) { riskScore = Math.max(riskScore, 55); flags.push('Proxy/anonymizer detected'); }
  if (isHosting) flags.push('Hosting/data center IP — often used for automated attacks and bots');

  const highRiskCountries = ['CN', 'RU', 'KP', 'NG', 'RO'];
  if (highRiskCountries.includes(country)) { riskScore = Math.min(100, riskScore + 10); flags.push(`IP originates from ${country} — elevated scam activity from this region`); }

  riskScore = Math.min(100, riskScore);

  return res.status(200).json({
    ip,
    country,
    region,
    city,
    isp,
    org,
    asn,
    isVpn,
    isProxy,
    isTor,
    isHosting,
    riskScore,
    flags,
    abuseReports,
    lat,
    lng,
  });
}
