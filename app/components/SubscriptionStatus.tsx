/**
 * SubscriptionStatus Component
 * Displays user's subscription status with styling
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import { formatSubscriptionStatus } from '../services/subscriptionService';

interface SubscriptionStatusProps {
  onUpgrade?: () => void;
  style?: any;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ onUpgrade, style }) => {
  const { subscription, isActive, isExpired, daysRemaining, loading } = useSubscriptionContext();

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color={palette.primary[700]} />
        <Text style={styles.loadingText}>Loading subscription...</Text>
      </View>
    );
  }

  if (!subscription) {
    return (
      <View style={[styles.container, styles.noSubscription, style]}>
        <View style={styles.header}>
          <Ionicons name="diamond-outline" size={24} color={palette.primary[700]} />
          <View style={styles.headerText}>
            <Text style={styles.title}>No Active Subscription</Text>
            <Text style={styles.subtitle}>Unlock premium features</Text>
          </View>
        </View>
        {onUpgrade && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={onUpgrade}
            accessibilityRole="button"
            accessibilityLabel="Upgrade to premium"
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            <Ionicons name="arrow-forward" size={16} color={palette.accent.white} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const statusColor = isActive
    ? palette.success
    : isExpired
    ? palette.error
    : palette.warning;

  const statusBg = isActive
    ? `${palette.success}15`
    : isExpired
    ? `${palette.error}15`
    : `${palette.warning}15`;

  return (
    <View style={[styles.container, { backgroundColor: statusBg }, style]}>
      <View style={styles.header}>
        <Ionicons
          name={isActive ? 'checkmark-circle' : 'warning'}
          size={24}
          color={statusColor}
        />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: statusColor }]}>
            {formatSubscriptionStatus(subscription.status)}
          </Text>
          {isActive && daysRemaining !== null && (
            <Text style={styles.subtitle}>
              {daysRemaining > 0
                ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
                : 'Renews today'}
            </Text>
          )}
          {isExpired && (
            <Text style={[styles.subtitle, { color: palette.error }]}>
              Subscription expired
            </Text>
          )}
        </View>
      </View>

      {subscription.current_period_end && (
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>
            {isActive ? 'Renews on' : 'Expired on'}
          </Text>
          <Text style={styles.dateValue}>
            {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
      )}

      {!isActive && onUpgrade && (
        <TouchableOpacity
          style={[styles.upgradeButton, { marginTop: spacing.md }]}
          onPress={onUpgrade}
          accessibilityRole="button"
          accessibilityLabel="Renew subscription"
        >
          <Text style={styles.upgradeButtonText}>Renew Subscription</Text>
          <Ionicons name="arrow-forward" size={16} color={palette.accent.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: palette.primary[100],
    minHeight: 44,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background.light,
  },
  loadingText: {
    ...typography.body,
    color: palette.text.light.secondary,
    marginLeft: spacing.sm,
  },
  noSubscription: {
    backgroundColor: palette.primary[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    ...typography.label,
    fontSize: 16,
    fontWeight: '700',
    color: palette.text.light.primary,
    marginBottom: spacing.xs - 2,
  },
  subtitle: {
    ...typography.caption,
    color: palette.text.light.secondary,
  },
  dateContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.primary[100],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    ...typography.caption,
    color: palette.text.light.secondary,
  },
  dateValue: {
    ...typography.label,
    fontWeight: '600',
    color: palette.text.light.primary,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary[700],
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginTop: spacing.base,
    minHeight: 44,
    gap: spacing.sm,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
  upgradeButtonText: {
    ...typography.label,
    fontSize: 15,
    fontWeight: '700',
    color: palette.accent.white,
  },
});
