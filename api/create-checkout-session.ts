import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface Product {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  mode: 'subscription';
}

// Server-side source of truth -- must match client catalog
const PRODUCTS: Product[] = [
  {
    id: 'starter',
    name: 'ScamTrace Starter',
    description: 'Evidence templates & basic investigation tools',
    priceMonthly: 900,
    priceYearly: 700,
    mode: 'subscription',
  },
  {
    id: 'pro',
    name: 'ScamTrace Pro',
    description: 'Scam reports, monitoring dashboard & unlimited scans',
    priceMonthly: 1900,
    priceYearly: 1500,
    mode: 'subscription',
  },
  {
    id: 'investigator',
    name: 'ScamTrace Investigator',
    description: 'Full investigation suite with OSINT, API access & dedicated support',
    priceMonthly: 4900,
    priceYearly: 3900,
    mode: 'subscription',
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, yearly, userId, email } = req.body;

    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      return res.status(400).json({ error: `Product "${productId}" not found` });
    }

    const unitAmount = yearly ? product.priceYearly : product.priceMonthly;

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      redirect_on_completion: 'never',
      customer_email: email || undefined,
      metadata: {
        product_id: product.id,
        user_id: userId || '',
      },
      subscription_data: {
        metadata: {
          product_id: product.id,
          user_id: userId || '',
        },
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: unitAmount,
            recurring: {
              interval: yearly ? 'year' : 'month',
            },
          },
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
