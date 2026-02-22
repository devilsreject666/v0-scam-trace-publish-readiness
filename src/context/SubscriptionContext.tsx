/**
 * Subscription context: manages tier limits, feature gating, and usage tracking.
 * Tiers: free, starter, pro, investigator
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Tier configuration
// ---------------------------------------------------------------------------

export type PlanTier = 'free' | 'starter' | 'pro' | 'investigator';

export interface TierLimits {
  scansPerMonth: number;
  maxDepth: number;          // max BFS hops
  pdfExport: boolean;
  csvExport: boolean;
  jsonExport: boolean;
  patternDetection: boolean;
  graphVisualization: boolean;
  graphMaxNodes: number;
  savedAnalyses: number;
  apiAccess: boolean;
}

export const TIER_LIMITS: Record<PlanTier, TierLimits> = {
  free: {
    scansPerMonth: 3,
    maxDepth: 1,
    pdfExport: false,
    csvExport: true,
    jsonExport: false,
    patternDetection: false,
    graphVisualization: true,
    graphMaxNodes: 25,
    savedAnalyses: 5,
    apiAccess: false,
  },
  starter: {
    scansPerMonth: 25,
    maxDepth: 2,
    pdfExport: true,
    csvExport: true,
    jsonExport: false,
    patternDetection: true,
    graphVisualization: true,
    graphMaxNodes: 100,
    savedAnalyses: 50,
    apiAccess: false,
  },
  pro: {
    scansPerMonth: 200,
    maxDepth: 3,
    pdfExport: true,
    csvExport: true,
    jsonExport: true,
    patternDetection: true,
    graphVisualization: true,
    graphMaxNodes: 500,
    savedAnalyses: 500,
    apiAccess: false,
  },
  investigator: {
    scansPerMonth: Infinity,
    maxDepth: 5,
    pdfExport: true,
    csvExport: true,
    jsonExport: true,
    patternDetection: true,
    graphVisualization: true,
    graphMaxNodes: Infinity,
    savedAnalyses: Infinity,
    apiAccess: true,
  },
};

export const TIER_NAMES: Record<PlanTier, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  investigator: 'Investigator',
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface UsageData {
  scansThisMonth: number;
  totalScans: number;
}

interface SubscriptionContextType {
  plan: PlanTier;
  limits: TierLimits;
  usage: UsageData;
  loading: boolean;
  canPerformScan: boolean;
  checkFeature: (feature: keyof TierLimits) => boolean;
  incrementUsage: (feature: string) => Promise<void>;
  refreshUsage: () => Promise<void>;
  getUpgradeMessage: (feature: string) => string;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [usage, setUsage] = useState<UsageData>({ scansThisMonth: 0, totalScans: 0 });
  const [loading, setLoading] = useState(true);

  const plan: PlanTier = (profile?.plan as PlanTier) || 'free';
  const limits = TIER_LIMITS[plan];

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setUsage({ scansThisMonth: 0, totalScans: 0 });
      setLoading(false);
      return;
    }

    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('usage_tracking')
        .select('count, period_start')
        .eq('user_id', user.id)
        .eq('feature', 'wallet_scan');

      let scansThisMonth = 0;
      let totalScans = 0;

      if (data) {
        for (const row of data) {
          totalScans += row.count;
          if (new Date(row.period_start) >= startOfMonth) {
            scansThisMonth += row.count;
          }
        }
      }

      setUsage({ scansThisMonth, totalScans });
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const canPerformScan = usage.scansThisMonth < limits.scansPerMonth;

  const checkFeature = useCallback(
    (feature: keyof TierLimits): boolean => {
      const val = limits[feature];
      if (typeof val === 'boolean') return val;
      if (typeof val === 'number') return val > 0;
      return true;
    },
    [limits],
  );

  const incrementUsage = useCallback(
    async (feature: string) => {
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from('usage_tracking')
        .select('id, count')
        .eq('user_id', user.id)
        .eq('feature', feature)
        .eq('period_start', today)
        .single();

      if (existing) {
        await supabase
          .from('usage_tracking')
          .update({ count: existing.count + 1 })
          .eq('id', existing.id);
      } else {
        await supabase.from('usage_tracking').insert({
          user_id: user.id,
          feature,
          count: 1,
          period_start: today,
        });
      }

      // Refresh locally
      setUsage((prev) => ({
        ...prev,
        scansThisMonth: prev.scansThisMonth + 1,
        totalScans: prev.totalScans + 1,
      }));
    },
    [user],
  );

  const refreshUsage = fetchUsage;

  const getUpgradeMessage = useCallback(
    (feature: string): string => {
      const tierOrder: PlanTier[] = ['free', 'starter', 'pro', 'investigator'];
      const currentIdx = tierOrder.indexOf(plan);
      const nextTier = currentIdx < tierOrder.length - 1 ? tierOrder[currentIdx + 1] : null;

      if (!nextTier) return 'You are on the highest plan.';
      return `Upgrade to ${TIER_NAMES[nextTier]} to unlock ${feature}.`;
    },
    [plan],
  );

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        limits,
        usage,
        loading,
        canPerformScan,
        checkFeature,
        incrementUsage,
        refreshUsage,
        getUpgradeMessage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
