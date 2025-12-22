/**
 * useSubscription Hook
 * React hook for managing subscription state
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import {
  getUserSubscription,
  hasActiveSubscription,
  isSubscriptionExpired,
  getDaysRemaining,
  type Subscription,
} from '../services/subscriptionService';
import { supabase } from '../services/supabase';

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuthContext();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscription(null);
      setIsActive(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [subData, activeStatus] = await Promise.all([
        getUserSubscription(user.id),
        hasActiveSubscription(user.id),
      ]);

      setSubscription(subData);
      setIsActive(activeStatus);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Set up real-time subscription to subscription changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refresh subscription when it changes
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchSubscription]);

  const isExpired = subscription ? isSubscriptionExpired(subscription) : false;
  const daysRemaining = subscription ? getDaysRemaining(subscription) : null;

  return {
    subscription,
    isActive,
    isExpired,
    daysRemaining,
    loading,
    error,
    refresh: fetchSubscription,
  };
}
