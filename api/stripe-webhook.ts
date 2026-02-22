import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const PRODUCT_TO_PLAN: Record<string, string> = {
  starter: 'starter',
  pro: 'pro',
  investigator: 'investigator',
};

export const config = {
  api: { bodyParser: false },
};

async function buffer(readable: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function updateUserPlan(userId: string, plan: string, customerId: string) {
  if (!userId) return;

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan,
      stripe_customer_id: customerId,
    })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update user plan:', error);
  }
}

async function downgradeUser(customerId: string) {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (data) {
    await supabaseAdmin
      .from('profiles')
      .update({ plan: 'free' })
      .eq('id', data.id);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    console.error('Webhook signature verification failed:', message);
    return res.status(400).json({ error: message });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const productId = session.metadata?.product_id;
        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;

        if (productId && userId) {
          const plan = PRODUCT_TO_PLAN[productId] || 'free';
          await updateUserPlan(userId, plan, customerId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const productId = subscription.metadata?.product_id;
        const userId = subscription.metadata?.user_id;
        const customerId = subscription.customer as string;

        if (subscription.status === 'active' && productId && userId) {
          const plan = PRODUCT_TO_PLAN[productId] || 'free';
          await updateUserPlan(userId, plan, customerId);
        } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          await downgradeUser(customerId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        await downgradeUser(customerId);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }

  return res.status(200).json({ received: true });
}
