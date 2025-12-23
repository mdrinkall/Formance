/**
 * Subscription Context
 * Provides app-wide access to user subscription status
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import type { Subscription } from '../services/subscriptionService';

interface SubscriptionContextValue {
  subscription: Subscription | null;
  isActive: boolean;
  isExpired: boolean;
  isPastDue: boolean;
  needsPaymentMethod: boolean;
  daysRemaining: number | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  requireSubscription: () => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const subscriptionData = useSubscription();

  /**
   * Helper function to check if feature requires active subscription
   * Returns true if user has active subscription, false otherwise
   */
  const requireSubscription = (): boolean => {
    return subscriptionData.isActive;
  };

  const value: SubscriptionContextValue = {
    ...subscriptionData,
    requireSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/**
 * Hook to access subscription context
 * Must be used within SubscriptionProvider
 */
export function useSubscriptionContext(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);

  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within SubscriptionProvider');
  }

  return context;
}
