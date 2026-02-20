/* ================================================================
   ScamTrace — Entity Extraction Utilities
   Client-side regex-based extraction for wallets, URLs, phones, emails.
   ================================================================ */

export interface ExtractedEntity {
  type: 'wallet_eth' | 'wallet_btc' | 'wallet_tron' | 'url' | 'phone' | 'email';
  value: string;
  label: string;
}

/* ------------------------------------------------------------------ */
/*  Wallet Extraction                                                  */
/* ------------------------------------------------------------------ */

const ETH_REGEX = /\b0x[a-fA-F0-9]{40}\b/g;
const BTC_REGEX = /\b(?:bc1[a-zA-HJ-NP-Z0-9]{25,62}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/g;
const TRON_REGEX = /\bT[1-9A-HJ-NP-Za-km-z]{33}\b/g;

export function extractWallets(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const seen = new Set<string>();

  for (const match of text.matchAll(ETH_REGEX)) {
    const val = match[0];
    if (!seen.has(val.toLowerCase())) {
      seen.add(val.toLowerCase());
      entities.push({ type: 'wallet_eth', value: val, label: `ETH: ${val.slice(0, 6)}...${val.slice(-4)}` });
    }
  }

  for (const match of text.matchAll(BTC_REGEX)) {
    const val = match[0];
    if (!seen.has(val)) {
      seen.add(val);
      entities.push({ type: 'wallet_btc', value: val, label: `BTC: ${val.slice(0, 6)}...${val.slice(-4)}` });
    }
  }

  for (const match of text.matchAll(TRON_REGEX)) {
    const val = match[0];
    if (!seen.has(val)) {
      seen.add(val);
      entities.push({ type: 'wallet_tron', value: val, label: `TRON: ${val.slice(0, 6)}...${val.slice(-4)}` });
    }
  }

  return entities;
}

/* ------------------------------------------------------------------ */
/*  URL Extraction                                                     */
/* ------------------------------------------------------------------ */

const URL_REGEX = /https?:\/\/[^\s<>"')\]]+/gi;
const DOMAIN_REGEX = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|org|net|xyz|io|co|app|dev|site|info|biz|us|uk|de|fr|ru|cn|top|club|online|store|link|click|buzz|tk|ml|ga|cf|gq|work|icu)\b/gi;

export function extractUrls(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const seen = new Set<string>();

  for (const match of text.matchAll(URL_REGEX)) {
    const val = match[0].replace(/[.,;!?)]+$/, '');
    if (!seen.has(val.toLowerCase())) {
      seen.add(val.toLowerCase());
      try {
        const domain = new URL(val).hostname;
        entities.push({ type: 'url', value: val, label: domain });
      } catch {
        entities.push({ type: 'url', value: val, label: val.slice(0, 40) });
      }
    }
  }

  // Also match bare domains
  for (const match of text.matchAll(DOMAIN_REGEX)) {
    const val = match[0];
    const fullUrl = `https://${val}`;
    if (!seen.has(val.toLowerCase()) && !seen.has(fullUrl.toLowerCase())) {
      seen.add(val.toLowerCase());
      entities.push({ type: 'url', value: val, label: val });
    }
  }

  return entities;
}

/* ------------------------------------------------------------------ */
/*  Phone Extraction                                                   */
/* ------------------------------------------------------------------ */

const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
const INTL_PHONE_REGEX = /\+[1-9]\d{6,14}/g;

export function extractPhones(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const seen = new Set<string>();

  for (const regex of [INTL_PHONE_REGEX, PHONE_REGEX]) {
    for (const match of text.matchAll(regex)) {
      const val = match[0].trim();
      const digits = val.replace(/\D/g, '');
      if (digits.length >= 7 && !seen.has(digits)) {
        seen.add(digits);
        entities.push({ type: 'phone', value: val, label: val });
      }
    }
  }

  return entities;
}

/* ------------------------------------------------------------------ */
/*  Email Extraction                                                   */
/* ------------------------------------------------------------------ */

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function extractEmails(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const seen = new Set<string>();

  for (const match of text.matchAll(EMAIL_REGEX)) {
    const val = match[0].toLowerCase();
    if (!seen.has(val)) {
      seen.add(val);
      entities.push({ type: 'email', value: val, label: val });
    }
  }

  return entities;
}

/* ------------------------------------------------------------------ */
/*  IP Extraction                                                      */
/* ------------------------------------------------------------------ */

const IP_REGEX = /\b(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\b/g;

export function extractIPs(text: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const match of text.matchAll(IP_REGEX)) {
    const val = match[0];
    if (!seen.has(val)) {
      seen.add(val);
      result.push(val);
    }
  }

  return result;
}

/* ------------------------------------------------------------------ */
/*  All-in-one Extraction                                              */
/* ------------------------------------------------------------------ */

export function extractAllEntities(text: string): ExtractedEntity[] {
  return [
    ...extractWallets(text),
    ...extractUrls(text),
    ...extractPhones(text),
    ...extractEmails(text),
  ];
}

/* ------------------------------------------------------------------ */
/*  Chat Export Parser                                                 */
/* ------------------------------------------------------------------ */

export interface ParsedMessage {
  sender: string;
  text: string;
  time: string;
}

export function parseChatExport(content: string, platform: string): ParsedMessage[] {
  const lines = content.split('\n').filter(l => l.trim());
  const messages: ParsedMessage[] = [];

  if (platform === 'whatsapp') {
    // WhatsApp format: "1/15/24, 9:23 AM - John: message text"
    const wa = /^(\d{1,2}\/\d{1,2}\/\d{2,4},?\s*\d{1,2}:\d{2}\s*[AP]?M?)\s*-\s*([^:]+):\s*(.+)/;
    for (const line of lines) {
      const match = line.match(wa);
      if (match) {
        messages.push({ time: match[1], sender: match[2].trim(), text: match[3].trim() });
      } else if (messages.length > 0) {
        messages[messages.length - 1].text += '\n' + line;
      }
    }
  } else if (platform === 'telegram') {
    // Telegram JSON export
    try {
      const data = JSON.parse(content);
      const msgs = data.messages || data;
      if (Array.isArray(msgs)) {
        for (const msg of msgs) {
          const text = typeof msg.text === 'string' ? msg.text :
            Array.isArray(msg.text) ? msg.text.map((t: string | { text: string }) => typeof t === 'string' ? t : t.text || '').join('') : '';
          if (text) {
            messages.push({
              sender: msg.from || msg.actor || 'Unknown',
              text,
              time: msg.date || '',
            });
          }
        }
      }
    } catch {
      // Fallback: treat as plain text
      for (const line of lines) {
        if (line.trim()) {
          messages.push({ sender: 'Unknown', text: line, time: '' });
        }
      }
    }
  } else {
    // Generic: each line is a message
    for (const line of lines) {
      if (line.trim()) {
        messages.push({ sender: 'Unknown', text: line.trim(), time: '' });
      }
    }
  }

  return messages;
}
