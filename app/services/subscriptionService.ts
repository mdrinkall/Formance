/**
 * Subscription Service
 * Handles subscription status checking and management
 */

import { supabase } from './supabase';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Valid active subscription statuses
 * - active: Subscription is active and in good standing
 * - trialing: Subscription is in trial period
 */
const ACTIVE_STATUSES = ['active', 'trialing'];

/**
 * Check if a user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', userId)
      .in('status', ACTIVE_STATUSES)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }

    // No active subscriptions found
    if (!data || data.length === 0) {
      return false;
    }

    // Check the most recently updated active subscription
    const subscription = data[0];

    // Check if subscription period is still valid
    if (subscription.current_period_end) {
      const periodEnd = new Date(subscription.current_period_end);
      const now = new Date();
      return periodEnd > now;
    }

    // If no period end, just check status
    return ACTIVE_STATUSES.includes(subscription.status);
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

/**
 * Get user's subscription details
 * Prioritizes active subscriptions, falls back to most recent
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    // First, try to get the most recent active subscription
    const { data: activeData, error: activeError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ACTIVE_STATUSES)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (!activeError && activeData && activeData.length > 0) {
      return activeData[0] as Subscription;
    }

    // If no active subscription, get the most recent one (any status)
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    return data[0] as Subscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

/**
 * Check if subscription is expired
 */
export function isSubscriptionExpired(subscription: Subscription): boolean {
  if (!subscription.current_period_end) {
    return !ACTIVE_STATUSES.includes(subscription.status);
  }

  const periodEnd = new Date(subscription.current_period_end);
  const now = new Date();
  return periodEnd <= now || !ACTIVE_STATUSES.includes(subscription.status);
}

/**
 * Get days remaining in subscription
 */
export function getDaysRemaining(subscription: Subscription): number | null {
  if (!subscription.current_period_end) {
    return null;
  }

  const periodEnd = new Date(subscription.current_period_end);
  const now = new Date();
  const diffTime = periodEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

/**
 * Format subscription status for display
 */
export function formatSubscriptionStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Active',
    trialing: 'Trial',
    past_due: 'Past Due',
    canceled: 'Canceled',
    unpaid: 'Unpaid',
    incomplete: 'Incomplete',
    incomplete_expired: 'Expired',
  };

  return statusMap[status] || status;
}
