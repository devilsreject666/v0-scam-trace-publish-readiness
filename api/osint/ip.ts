import type { VercelRequest, VercelResponse } from '@vercel/node';

// Real IP intelligence using ip-api.com (free, 45 req/min) + proxycheck.io
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ip } = req.body;
  if (!ip || typeof ip !== 'string') return res.status(400).json({ error: 'ip is required' });

  // Basic IPv4/IPv6 validation
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
  const ipv6 = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(ip);
  if (!ipv4 && !ipv6) return res.status(400).json({ error: 'Invalid IP address format' });

  try {
    // Parallel lookups: ip-api.com (geo + ISP) and proxycheck.io (VPN/proxy/Tor)
    const [geoRes, proxyRes] = await Promise.all([
      fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,lat,lon,isp,org,as,hosting,mobile,proxy`),
      fetchProxyCheck(ip),
    ]);

    let geoData: Record<string, unknown> = {};
    if (geoRes.ok) {
      geoData = await geoRes.json();
      if ((geoData as { status?: string }).status === 'fail') {
        return res.status(400).json({ error: (geoData as { message?: string }).message || 'IP lookup failed' });
      }
    }

    // Build risk flags
    const flags: string[] = [];
    let riskScore = 0;

    const isProxy = (geoData as { proxy?: boolean }).proxy || proxyRes.isProxy;
    const isVpn = proxyRes.isVpn;
    const isTor = proxyRes.isTor;
    const isHosting = (geoData as { hosting?: boolean }).hosting || false;

    if (isTor) { flags.push('Tor exit node -- used for anonymized traffic'); riskScore += 35; }
    if (isVpn) { flags.push('VPN connection detected -- IP masked'); riskScore += 20; }
    if (isProxy) { flags.push('Proxy/anonymizer detected'); riskScore += 15; }
    if (isHosting) { flags.push('Hosting/datacenter IP -- not a residential connection'); riskScore += 10; }

    // Check known abuse databases (free AbuseIPDB check if key available)
    let abuseReports = 0;
    const abuseKey = process.env.ABUSEIPDB_KEY;
    if (abuseKey) {
      try {
        const abuseRes = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
          headers: { Key: abuseKey, Accept: 'application/json' },
        });
        if (abuseRes.ok) {
          const abuseData = await abuseRes.json();
          const data = (abuseData as { data?: { totalReports?: number; abuseConfidenceScore?: number } }).data;
          abuseReports = data?.totalReports || 0;
          const confidence = data?.abuseConfidenceScore || 0;
          if (abuseReports > 0) {
            flags.push(`${abuseReports} abuse reports in last 90 days (confidence: ${confidence}%)`);
            riskScore += Math.min(30, Math.floor(confidence / 3));
          }
        }
      } catch { /* non-critical */ }
    }

    // ISP-based risk signals
    const isp = ((geoData as { isp?: string }).isp || '').toLowerCase();
    const knownBadIsps = ['frantech', 'm247', 'alexhost', 'flokinet'];
    if (knownBadIsps.some(b => isp.includes(b))) {
      flags.push('ISP known for bulletproof hosting / abuse-friendly');
      riskScore += 15;
    }

    riskScore = Math.min(100, Math.max(0, riskScore));

    const result = {
      ip,
      country: (geoData as { country?: string }).country || 'Unknown',
      region: (geoData as { regionName?: string }).regionName || 'Unknown',
      city: (geoData as { city?: string }).city || 'Unknown',
      isp: (geoData as { isp?: string }).isp || 'Unknown',
      org: (geoData as { org?: string }).org || 'Unknown',
      asn: (geoData as { as?: string }).as || 'Unknown',
      isVpn,
      isProxy,
      isTor,
      isHosting,
      riskScore,
      flags,
      abuseReports,
      lat: (geoData as { lat?: number }).lat || 0,
      lng: (geoData as { lon?: number }).lon || 0,
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error('IP OSINT error:', err);
    return res.status(500).json({ error: 'Failed to lookup IP address' });
  }
}

async function fetchProxyCheck(ip: string): Promise<{ isVpn: boolean; isProxy: boolean; isTor: boolean }> {
  const key = process.env.PROXYCHECK_KEY;
  try {
    const url = key
      ? `https://proxycheck.io/v2/${ip}?key=${key}&vpn=1&asn=1&risk=1`
      : `https://proxycheck.io/v2/${ip}?vpn=1&asn=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json() as Record<string, { proxy?: string; type?: string }>;
      const ipData = data[ip];
      if (ipData) {
        return {
          isVpn: ipData.type === 'VPN',
          isProxy: ipData.proxy === 'yes',
          isTor: ipData.type === 'TOR',
        };
      }
    }
  } catch { /* non-critical */ }
  return { isVpn: false, isProxy: false, isTor: false };
}
