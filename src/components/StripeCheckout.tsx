import { useCallback, useState } from 'react';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { X, CreditCard, ShieldCheck } from 'lucide-react';

const stripeKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ??
  import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface StripeCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  yearly: boolean;
}

export function StripeCheckout({ isOpen, onClose, productId, productName, yearly }: StripeCheckoutProps) {
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    setError(null);
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, yearly }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Failed to start checkout' }));
      setError(data.error || 'Failed to start checkout');
      throw new Error(data.error || 'Failed to start checkout');
    }

    const { clientSecret } = await res.json();
    return clientSecret;
  }, [productId, yearly]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-dark-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyber-green to-cyber-blue">
              <CreditCard className="h-5 w-5 text-dark-900" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Subscribe to {productName}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Secured by Stripe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Checkout body */}
        <div className="p-5">
          {!stripePromise ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-6 text-center">
              <p className="text-sm text-amber-400">
                Stripe is not configured yet. Please add the STRIPE_PUBLISHABLE_KEY environment variable.
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-6 text-center">
              <p className="text-sm text-red-400 mb-3">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-cyber-green hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ fetchClientSecret }}
            >
              <EmbeddedCheckout className="rounded-xl overflow-hidden" />
            </EmbeddedCheckoutProvider>
          )}
        </div>
      </div>
    </div>
  );
}
