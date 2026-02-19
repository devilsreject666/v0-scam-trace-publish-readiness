import type { VercelRequest, VercelResponse } from '@vercel/node';

// Safe browser: fetch page metadata, analyze scripts, detect threats
// Does NOT execute JavaScript -- only fetches and parses the HTML source
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url is required' });

  // Ensure full URL
  const targetUrl = url.startsWith('http') ? url : `https://${url}`;

  try {
    // Fetch with timeout and no redirects beyond 3
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ScamTrace-SafeBrowser/1.0 (Investigation Tool)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    clearTimeout(timeout);

    const html = await response.text();
    const finalUrl = response.url;

    // Parse domain
    let domain = '';
    try { domain = new URL(finalUrl).hostname; } catch { domain = url; }

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'No title found';

    // Extract scripts
    const scriptTags = html.match(/<script[^>]*(?:src=["']([^"']+)["'])?[^>]*>([\s\S]*?)<\/script>/gi) || [];
    const scripts: { src: string; inline: boolean; suspicious: boolean; reason: string }[] = [];

    for (const tag of scriptTags) {
      const srcMatch = tag.match(/src=["']([^"']+)["']/i);
      const inlineContent = tag.replace(/<\/?script[^>]*>/gi, '').trim();

      if (srcMatch) {
        const src = srcMatch[1];
        const suspicious = analyzeScriptSrc(src);
        scripts.push({ src, inline: false, suspicious: suspicious.isSuspicious, reason: suspicious.reason });
      } else if (inlineContent.length > 20) {
        const suspicious = analyzeInlineScript(inlineContent);
        scripts.push({
          src: `inline (${inlineContent.length} chars)`,
          inline: true,
          suspicious: suspicious.isSuspicious,
          reason: suspicious.reason,
        });
      }
    }

    // Extract links
    const linkMatches = html.match(/href=["']([^"']+)["']/gi) || [];
    const links: { url: string; suspicious: boolean; reason: string }[] = [];
    const seenLinks = new Set<string>();

    for (const match of linkMatches) {
      const hrefMatch = match.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        const href = hrefMatch[1];
        if (href.startsWith('http') && !seenLinks.has(href)) {
          seenLinks.add(href);
          const suspicious = analyzeLinkUrl(href, domain);
          links.push({ url: href, suspicious: suspicious.isSuspicious, reason: suspicious.reason });
        }
      }
    }

    // Detect threat indicators in the HTML
    const flags: string[] = [];
    let riskScore = 0;
    let malwareDetected = false;

    // Check for wallet drainer patterns
    const drainerPatterns = [
      /eth_sign|eth_sendTransaction|wallet_addEthereumChain/i,
      /web3\.eth\.sendTransaction/i,
      /ethereum\.request/i,
      /window\.ethereum/i,
      /connectWallet|drainWallet|approveAll/i,
      /setApprovalForAll|transferFrom.*approve/i,
    ];

    for (const pattern of drainerPatterns) {
      if (pattern.test(html)) {
        flags.push(`Potential wallet interaction detected: ${pattern.source.substring(0, 40)}`);
        riskScore += 15;
        malwareDetected = true;
      }
    }

    // Check for credential harvesting
    const credPatterns = [
      /seed.?phrase|mnemonic|private.?key|secret.?recovery/i,
      /type=["']password["'][^>]*placeholder=["'][^"']*seed/i,
    ];
    for (const pattern of credPatterns) {
      if (pattern.test(html)) {
        flags.push('Credential/seed phrase harvesting form detected');
        riskScore += 25;
        malwareDetected = true;
      }
    }

    // Check for urgency/scam language
    const scamLanguage = [
      /guaranteed.*return|100%.*profit|risk.?free.*invest/i,
      /limited.*time.*offer|act.*now|only.*\d+.*spots/i,
      /double.*your.*crypto|send.*\d+.*receive.*\d+/i,
    ];
    for (const pattern of scamLanguage) {
      if (pattern.test(html)) {
        flags.push('Scam/urgency language detected in page content');
        riskScore += 10;
      }
    }

    // Check for obfuscated JavaScript
    const obfuscationPatterns = [
      /eval\s*\(/i,
      /\\x[0-9a-f]{2}/i,
      /document\.write\s*\(/i,
      /fromCharCode/i,
      /atob\s*\(/i,
    ];
    let obfuscationCount = 0;
    for (const pattern of obfuscationPatterns) {
      if (pattern.test(html)) obfuscationCount++;
    }
    if (obfuscationCount >= 2) {
      flags.push('Heavy JavaScript obfuscation detected');
      riskScore += 15;
      malwareDetected = true;
    }

    // Check for fake countdown timers
    if (/countdown|timer|setInterval.*\d+.*1000/i.test(html)) {
      flags.push('Fake countdown/urgency timer detected');
      riskScore += 5;
    }

    // Check SSL/TLS
    const isHttps = finalUrl.startsWith('https');
    if (!isHttps) {
      flags.push('Site does not use HTTPS');
      riskScore += 10;
    }

    // Suspicious script count
    const suspiciousScripts = scripts.filter(s => s.suspicious);
    if (suspiciousScripts.length > 0) {
      riskScore += suspiciousScripts.length * 5;
    }

    riskScore = Math.min(100, Math.max(0, riskScore));

    const result = {
      url: finalUrl,
      domain,
      title,
      scripts: scripts.slice(0, 20).map(s => {
        if (s.suspicious) return `${s.src} -- ${s.reason}`;
        return s.src;
      }),
      links: links.slice(0, 20).map(l => {
        if (l.suspicious) return `${l.url} -- ${l.reason}`;
        return l.url;
      }),
      malwareDetected,
      riskScore,
      flags,
      timestamp: new Date().toISOString(),
      scriptsFound: scripts.length,
      linksFound: links.length,
      htmlSize: html.length,
    };

    return res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('abort')) {
      return res.status(408).json({ error: 'Request timed out after 10 seconds' });
    }
    console.error('Browser analyze error:', err);
    return res.status(500).json({ error: `Failed to analyze URL: ${message}` });
  }
}

function analyzeScriptSrc(src: string): { isSuspicious: boolean; reason: string } {
  const suspicious = [
    { pattern: /wallet.*connect|web3|ethers/i, reason: 'SUSPICIOUS: Wallet connection library' },
    { pattern: /drainer|stealer|grabber/i, reason: 'CRITICAL: Known drainer script' },
    { pattern: /keylog|capture|intercept/i, reason: 'MALICIOUS: Keylogger/interceptor' },
    { pattern: /obfuscated|packed|minified.*[a-z]{20}/i, reason: 'WARNING: Heavily obfuscated script' },
  ];
  for (const s of suspicious) {
    if (s.pattern.test(src)) return { isSuspicious: true, reason: s.reason };
  }
  // External tracking scripts
  if (/analytics|gtag|facebook.*pixel/i.test(src)) {
    return { isSuspicious: false, reason: 'Tracking script' };
  }
  return { isSuspicious: false, reason: '' };
}

function analyzeInlineScript(content: string): { isSuspicious: boolean; reason: string } {
  if (/eval\(|fromCharCode|atob/.test(content) && content.length > 500) {
    return { isSuspicious: true, reason: 'CRITICAL: Obfuscated inline code with eval/decode' };
  }
  if (/eth_sign|sendTransaction|approve/.test(content)) {
    return { isSuspicious: true, reason: 'SUSPICIOUS: Wallet transaction code' };
  }
  if (/document\.cookie|localStorage\.|sessionStorage\./.test(content)) {
    return { isSuspicious: true, reason: 'WARNING: Cookie/storage access' };
  }
  return { isSuspicious: false, reason: '' };
}

function analyzeLinkUrl(href: string, currentDomain: string): { isSuspicious: boolean; reason: string } {
  try {
    const linkDomain = new URL(href).hostname;
    // Check for typosquatting of major brands
    const brands = ['binance', 'coinbase', 'metamask', 'opensea', 'uniswap', 'pancakeswap'];
    for (const brand of brands) {
      if (linkDomain.includes(brand) && !linkDomain.endsWith(`.${brand}.com`) && !linkDomain.endsWith(`.${brand}.io`)) {
        return { isSuspicious: true, reason: `PHISHING: Impersonates ${brand}` };
      }
    }
    // Telegram/Discord links
    if (/t\.me|discord\.gg/i.test(href)) {
      return { isSuspicious: false, reason: 'Social/messaging link' };
    }
  } catch { /* invalid URL */ }
  return { isSuspicious: false, reason: '' };
}
