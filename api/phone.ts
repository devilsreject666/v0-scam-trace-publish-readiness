import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { number } = req.query;
  if (!number || typeof number !== "string") {
    return res.status(400).json({ error: "Missing number parameter" });
  }

  const phone = number.trim();
  const apiKey = process.env.ABSTRACT_API_KEY;

  if (!apiKey) {
    const basicResult = analyzePhoneBasic(phone);
    return res.status(200).json({
      ...basicResult,
      note: "Limited analysis — ABSTRACT_API_KEY not configured",
    });
  }

  try {
    const response = await fetch(
      `https://phonevalidation.abstractapi.com/v1/?api_key=${apiKey}&phone=${encodeURIComponent(phone)}`
    );

    if (!response.ok) {
      throw new Error(`Abstract API error: ${response.status}`);
    }

    const data = await response.json();
    const riskFlags: string[] = [];
    let riskScore = 0;

    if (!data.valid) {
      riskFlags.push("Phone number is invalid");
      riskScore = 90;
    } else {
      if (data.type === "VOIP") {
        riskFlags.push("VoIP number — commonly used in scams");
        riskScore += 70;
      }
      if (data.type === "PREPAID") {
        riskFlags.push("Prepaid number — harder to trace");
        riskScore += 50;
      }
      if (!data.carrier?.name) {
        riskFlags.push("Carrier information unavailable");
        riskScore += 15;
      }
    }

    return res.status(200).json({
      number: data.phone,
      valid: data.valid,
      country: data.country?.name || null,
      countryCode: data.country?.calling_code || null,
      carrier: data.carrier?.name || null,
      type: data.type || null,
      format: {
        international: data.format?.international || phone,
        local: data.format?.local || phone,
      },
      riskScore: Math.min(riskScore, 100),
      riskFlags,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

function analyzePhoneBasic(phone: string) {
  const riskFlags: string[] = [];
  let riskScore = 10;
  const clean = phone.replace(/\D/g, "");

  if (clean.length < 7 || clean.length > 15) {
    riskFlags.push("Unusual length for a phone number");
    riskScore += 30;
  }

  if (clean.startsWith("900") || clean.startsWith("976")) {
    riskFlags.push("Premium rate number");
    riskScore += 50;
  }

  return {
    number: phone,
    valid: clean.length >= 7 && clean.length <= 15,
    country: null,
    carrier: null,
    type: null,
    riskScore: Math.min(riskScore, 100),
    riskFlags,
  };
}
