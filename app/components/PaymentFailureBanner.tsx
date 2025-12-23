/**
 * PaymentFailureBanner
 * Warning banner shown when payment has failed
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import { supabase } from '../services/supabase';

export const PaymentFailureBanner: React.FC = () => {
  const { needsPaymentMethod, isPastDue } = useSubscriptionContext();
  const [loading, setLoading] = React.useState(false);

  if (!needsPaymentMethod) {
    return null;
  }

  const handleUpdatePayment = async () => {
    try {
      setLoading(true);

      const returnUrl = Platform.OS === 'web'
        ? window.location.href
        : 'formance://settings';

      const { data, error } = await supabase.functions.invoke('create-billing-portal-session', {
        body: { return_url: returnUrl },
      });

      if (error) {
        console.error('Error creating billing portal session:', error);
        return;
      }

      if (data?.url) {
        if (Platform.OS === 'web') {
          window.location.href = data.url;
        } else {
          await Linking.openURL(data.url);
        }
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="warning" size={20} color={palette.error} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Payment Failed</Text>
          <Text style={styles.description}>
            {isPastDue
              ? 'Your payment method was declined. Update it to continue your subscription.'
              : 'Please update your payment method to avoid service interruption.'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleUpdatePayment}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Update payment method"
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Update Payment'}
        </Text>
        <Ionicons name="arrow-forward" size={16} color={palette.accent.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${palette.error}15`,
    borderLeftWidth: 4,
    borderLeftColor: palette.error,
    padding: spacing.base,
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    ...typography.label,
    fontSize: 15,
    fontWeight: '600',
    color: palette.error,
    marginBottom: spacing.xs - 2,
  },
  description: {
    ...typography.body,
    fontSize: 13,
    color: palette.text.light.secondary,
    lineHeight: 18,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.error,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
  buttonText: {
    ...typography.label,
    fontSize: 14,
    fontWeight: '500',
    color: palette.accent.white,
  },
});
