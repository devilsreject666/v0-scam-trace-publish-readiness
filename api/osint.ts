import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { domain, ip } = req.query;

  if (ip && typeof ip === "string") {
    return handleIPLookup(ip.trim(), res);
  }

  if (domain && typeof domain === "string") {
    return handleDomainLookup(domain.trim(), res);
  }

  return res.status(400).json({ error: "Provide ?domain= or ?ip= parameter" });
}

async function handleIPLookup(ip: string, res: VercelResponse) {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,city,isp,org,as,proxy,hosting,query`);
    if (!response.ok) throw new Error(`ip-api error: ${response.status}`);
    const data = await response.json();

    if (data.status === "fail") {
      return res.status(400).json({ error: "Invalid IP address" });
    }

    const riskFlags: string[] = [];
    let riskScore = 0;

    if (data.proxy) { riskFlags.push("Proxy/VPN detected"); riskScore += 40; }
    if (data.hosting) { riskFlags.push("Hosting/datacenter IP"); riskScore += 30; }
    if (!data.proxy && !data.hosting) riskScore = 10;

    return res.status(200).json({
      ip: data.query,
      country: data.country,
      countryCode: data.countryCode,
      region: data.region,
      city: data.city,
      isp: data.isp,
      org: data.org,
      asn: data.as,
      isProxy: data.proxy || false,
      isHosting: data.hosting || false,
      riskScore: Math.min(riskScore, 100),
      riskFlags,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

async function handleDomainLookup(domain: string, res: VercelResponse) {
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0];
    const tld = cleanDomain.split(".").slice(-2).join(".");

    const [rdapRes, dnsRes] = await Promise.allSettled([
      fetch(`https://rdap.org/domain/${tld}`),
      fetch(`https://dns.google/resolve?name=${cleanDomain}&type=A`),
    ]);

    let regDate: string | null = null;
    let expDate: string | null = null;
    let registrar: string | null = null;
    let domainAgeDays = 0;
    const riskFlags: string[] = [];

    if (rdapRes.status === "fulfilled" && rdapRes.value.ok) {
      const rdap = await rdapRes.value.json();
      const events: Array<{ eventAction: string; eventDate: string }> = rdap.events || [];
      for (const ev of events) {
        if (ev.eventAction === "registration") regDate = ev.eventDate;
        if (ev.eventAction === "expiration") expDate = ev.eventDate;
      }
      const entities = rdap.entities || [];
      for (const entity of entities) {
        if (entity.roles?.includes("registrar")) {
          registrar = entity.vcardArray?.[1]?.find(
            (f: unknown[]) => f[0] === "fn"
          )?.[3] || null;
        }
      }
    }

    if (regDate) {
      domainAgeDays = Math.floor(
        (Date.now() - new Date(regDate).getTime()) / 86400000
      );
      if (domainAgeDays < 30) {
        riskFlags.push("Domain registered less than 30 days ago");
      } else if (domainAgeDays < 180) {
        riskFlags.push("Domain is less than 6 months old");
      }
    }

    let ips: string[] = [];
    if (dnsRes.status === "fulfilled" && dnsRes.value.ok) {
      const dns = await dnsRes.value.json();
      ips = (dns.Answer || [])
        .filter((r: { type: number }) => r.type === 1)
        .map((r: { data: string }) => r.data);
    }

    let ipDetails: object[] = [];
    if (ips.length > 0) {
      const ipRes = await fetch(
        `http://ip-api.com/json/${ips[0]}?fields=status,country,isp,proxy,hosting`
      );
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        ipDetails = [ipData];
        if (ipData.proxy) riskFlags.push("IP is a proxy/VPN");
        if (ipData.hosting) riskFlags.push("IP is a hosting/datacenter address");
      }
    }

    const riskScore = Math.min(
      (domainAgeDays < 30 ? 50 : domainAgeDays < 180 ? 25 : 0) +
        (riskFlags.filter((f) => f.includes("proxy") || f.includes("hosting")).length * 20),
      100
    );

    return res.status(200).json({
      domain: cleanDomain,
      registrar,
      regDate,
      expDate,
      domainAgeDays,
      ips,
      ipDetails,
      riskScore,
      riskFlags,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
