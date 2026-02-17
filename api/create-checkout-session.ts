import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Map product IDs + billing cycle to real Stripe Price IDs
const PRICE_MAP: Record<string, { monthly: string; yearly: string }> = {
  starter: {
    monthly: 'price_1T1e0NCZR1DeXKstixpC7eCV',
    yearly: 'price_1T1e14CZR1DeXKstVLLCH5Xg',
  },
  pro: {
    monthly: 'price_1T1fPbCZR1DeXKstdeUbDK6U',
    yearly: 'price_1T1fQ6CZR1DeXKstrPV6Uctv',
  },
  investigator: {
    monthly: 'price_1T1fQCCZR1DeXKstEQ35imFZ',
    yearly: 'price_1T1fQICZR1DeXKstt7wFJ8N2',
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, yearly } = req.body;

    const priceEntry = PRICE_MAP[productId];
    if (!priceEntry) {
      return res.status(400).json({ error: `Product "${productId}" not found` });
    }

    const priceId = yearly ? priceEntry.yearly : priceEntry.monthly;

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      redirect_on_completion: 'never',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
    });

    return res.status(200).json({ clientSecret: session.client_secret });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
}
