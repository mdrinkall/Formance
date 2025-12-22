/**
 * PaywallScreen
 * Paywall for analysis purchase with subscription option
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Button } from '../../components/ui/Button';
import { AnalysisStackParamList } from '../../types/analysis';
import { spacing, typography } from '../../styles';
import { palette } from '../../theme/palette';
import { useSubscriptionContext } from '../../context/SubscriptionContext';
import { supabase } from '../../services/supabase';

type Props = StackScreenProps<AnalysisStackParamList, 'Paywall'>;

export default function PaywallScreen({ route, navigation }: Props) {
  const { videoUrl, selectedClub, shotShape } = route.params;
  const { isActive: hasActiveSubscription, loading: subscriptionLoading } = useSubscriptionContext();
  const [isSubscribing, setIsSubscribing] = useState(false);

  // If user has active subscription, skip paywall
  useEffect(() => {
    if (!subscriptionLoading && hasActiveSubscription) {
      navigation.navigate('Loading', { videoUrl, selectedClub, shotShape });
    }
  }, [hasActiveSubscription, subscriptionLoading, navigation, videoUrl, selectedClub, shotShape]);

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);

      // Get the user's session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        Alert.alert('Error', 'Please log in to subscribe');
        return;
      }

      // TODO: Replace with your actual Stripe price ID
      const STRIPE_PRICE_ID = 'price_1SgsUFA6KzcdvOtic8aJo9TW';

      // Call the Edge Function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          price_id: STRIPE_PRICE_ID,
          success_url: 'formance://analysis',
          cancel_url: 'formance://analysis'
        }
      });

      if (error) {
        console.error('Checkout error:', error);
        Alert.alert('Error', 'Failed to create checkout session. Please try again.');
        return;
      }

      if (data?.url) {
        // Open Stripe Checkout in browser
        const supported = await Linking.canOpenURL(data.url);
        if (supported) {
          await Linking.openURL(data.url);
        } else {
          Alert.alert('Error', 'Cannot open checkout page');
        }
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleOneTimePurchase = () => {
    // TODO: Implement one-time payment flow
    Alert.alert('Coming Soon', 'One-time purchase option will be available soon. For now, please use the demo or subscribe.');
  };

  const handleContinue = () => {
    navigation.navigate('Loading', { videoUrl, selectedClub, shotShape });
  };

  // Show loading while checking subscription
  if (subscriptionLoading) {
    return (
      <View style={[styles.wrapper, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={palette.accent.white} />
        <Text style={styles.loadingText}>Checking subscription...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Decorative background elements */}
      <View style={styles.backgroundDecor} pointerEvents="none">
        <LinearGradient
          colors={[palette.primary[700], 'transparent']}
          style={styles.backgroundGradient}
          pointerEvents="none"
        />
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
            {/* Editorial Header */}
            <View style={styles.editorialHeader}>
              <View style={styles.headerAccent} />
              <View style={styles.headerContent}>
                <Text style={styles.headerLabel}>FINAL STEP</Text>
                <Text style={styles.title}>Unlock Your Analysis</Text>
                <Text style={styles.subtitle}>
                  Get professional AI-powered swing analysis with personalized feedback
                </Text>
              </View>
            </View>

            {/* One-Time Purchase Card */}
            <TouchableOpacity
              style={styles.pricingCard}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Purchase one-time analysis for £0.99"
              onPress={handleOneTimePurchase}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.06)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pricingGradient}
              >
                <View style={styles.pricingHeader}>
                  <View style={styles.pricingIcon}>
                    <Ionicons name="analytics" size={24} color={palette.secondary[500]} />
                  </View>
                  <Text style={styles.cardTitle}>One-Time Analysis</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>£0.99</Text>
                  <Text style={styles.priceLabel}>single analysis</Text>
                </View>
                <View style={styles.featuresList}>
                  <FeatureItem text="Detailed swing breakdown" />
                  <FeatureItem text="Personalized improvement tips" />
                  <FeatureItem text="Score & metrics analysis" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Pro Subscription Card */}
            <TouchableOpacity
              style={[styles.pricingCard, styles.popularCard]}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Subscribe to Pro plan for £9.99 per month"
              onPress={handleSubscribe}
              disabled={isSubscribing}
            >
              <LinearGradient
                colors={[palette.secondary[500] + '25', palette.secondary[500] + '15']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pricingGradient}
              >
                <View style={styles.popularBadge}>
                  <Ionicons name="star" size={14} color={palette.primary[900]} />
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
                <View style={styles.pricingHeader}>
                  <View style={[styles.pricingIcon, styles.pricingIconPro]}>
                    {isSubscribing ? (
                      <ActivityIndicator size="small" color={palette.primary[900]} />
                    ) : (
                      <Ionicons name="diamond" size={24} color={palette.primary[900]} />
                    )}
                  </View>
                  <Text style={[styles.cardTitle, styles.cardTitlePro]}>Pro Subscription</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={[styles.price, styles.pricePro]}>£9.99</Text>
                  <Text style={[styles.priceLabel, styles.priceLabelPro]}>per month</Text>
                </View>
                <View style={styles.featuresList}>
                  <FeatureItem text="Unlimited swing analyses" highlighted />
                  <FeatureItem text="Progress tracking & trends" highlighted />
                  <FeatureItem text="Advanced metrics dashboard" highlighted />
                  <FeatureItem text="AI coaching insights" highlighted />
                  <FeatureItem text="Priority support" highlighted />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <Button
              title="Continue with Demo"
              variant="secondary"
              size="lg"
              fullWidth
              onPress={handleContinue}
              style={styles.continueButton}
            />

            <View style={styles.noteContainer}>
              <Ionicons name="information-circle-outline" size={16} color={palette.accent.white} opacity={0.6} />
              <Text style={styles.note}>
                This is a demo - no actual payment required
              </Text>
            </View>
          </View>
        </ScrollView>
    </View>
  );
}

// Feature Item Component
function FeatureItem({ text, highlighted }: { text: string; highlighted?: boolean }) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureCheck, highlighted && styles.featureCheckHighlighted]}>
        <Ionicons name="checkmark" size={12} color={palette.accent.white} />
      </View>
      <Text style={[styles.featureText, highlighted && styles.featureTextHighlighted]}>{text}</Text>
    </View>
  );
}

// Helper for cross-platform shadows
const createShadow = (
  iosShadow: { shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number },
  androidElevation: number,
  webBoxShadow: string
) => {
  if (Platform.OS === 'web') {
    return { boxShadow: webBoxShadow };
  } else if (Platform.OS === 'android') {
    return { elevation: androidElevation };
  } else {
    return iosShadow;
  }
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.primary[900],
    ...Platform.select({
      web: {
        height: '100vh',
        maxHeight: '100vh',
      },
    }),
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: palette.accent.white,
    opacity: 0.8,
  },
  backgroundDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 500,
    zIndex: 0,
    overflow: 'hidden',
  },
  backgroundGradient: {
    flex: 1,
    opacity: 0.3,
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(233, 229, 214, 0.03)',
    top: -100,
    right: -50,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(233, 229, 214, 0.02)',
    top: 200,
    left: -30,
  },
  container: {
    flex: 1,
    flexShrink: 1,
    zIndex: 1,
    ...Platform.select({
      web: {
        overflow: 'auto',
      },
    }),
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.massive,
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  editorialHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xxxl,
  },
  headerAccent: {
    width: 4,
    height: 80,
    backgroundColor: palette.secondary[500],
    borderRadius: 2,
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: palette.secondary[500],
    marginBottom: spacing.xs - 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: palette.accent.white,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  subtitle: {
    ...typography.body,
    fontSize: 15,
    color: palette.accent.white,
    opacity: 0.85,
    lineHeight: 22,
  },
  pricingCard: {
    borderRadius: 16,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...createShadow(
      {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      2,
      '0 2px 8px rgba(0, 0, 0, 0.1)'
    ),
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        ':hover': {
          transform: 'translateY(-2px)',
        },
      } as any,
    }),
  },
  popularCard: {
    borderWidth: 2,
    borderColor: palette.secondary[500] + '40',
  },
  pricingGradient: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.base,
    right: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.secondary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    gap: spacing.xs - 2,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: palette.primary[900],
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pricingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(233, 229, 214, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  pricingIconPro: {
    backgroundColor: 'rgba(233, 229, 214, 0.2)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.accent.white,
    letterSpacing: -0.2,
    flex: 1,
  },
  cardTitlePro: {
    color: palette.accent.white,
  },
  priceContainer: {
    marginBottom: spacing.base,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: palette.secondary[500],
    letterSpacing: -1,
    lineHeight: 42,
  },
  pricePro: {
    color: palette.secondary[500],
  },
  priceLabel: {
    ...typography.caption,
    fontSize: 14,
    color: palette.accent.white,
    opacity: 0.7,
    marginTop: spacing.xs - 2,
  },
  priceLabelPro: {
    color: palette.secondary[500],
    opacity: 0.8,
  },
  featuresList: {
    gap: spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  featureCheckHighlighted: {
    backgroundColor: 'rgba(233, 229, 214, 0.25)',
  },
  featureText: {
    ...typography.body,
    fontSize: 14,
    color: palette.accent.white,
    opacity: 0.85,
    lineHeight: 20,
  },
  featureTextHighlighted: {
    opacity: 0.95,
  },
  continueButton: {
    marginTop: spacing.base,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.base,
  },
  note: {
    ...typography.caption,
    fontSize: 13,
    color: palette.accent.white,
    opacity: 0.6,
    textAlign: 'center',
  },
});
