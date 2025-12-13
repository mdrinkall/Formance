/**
 * PaywallScreen
 * Mock paywall for analysis purchase
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Button } from '../../components/ui/Button';
import { AnalysisStackParamList } from '../../types/analysis';
import { spacing, typography } from '../../styles';
import { palette } from '../../theme/palette';

type Props = StackScreenProps<AnalysisStackParamList, 'Paywall'>;

export default function PaywallScreen({ route, navigation }: Props) {
  const { videoUrl, selectedClub, shotShape } = route.params;

  const handleContinue = () => {
    navigation.navigate('Loading', { videoUrl, selectedClub, shotShape });
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
            <Text style={styles.title}>Unlock Your Analysis</Text>
            <Text style={styles.subtitle}>
              Get professional AI-powered swing analysis with personalized feedback
            </Text>

            <View style={styles.pricingCard}>
              <Text style={styles.cardTitle}>One-Time Analysis</Text>
              <Text style={styles.price}>£0.99</Text>
              <Text style={styles.cardDescription}>
                Detailed analysis of this swing with improvement suggestions
              </Text>
            </View>

            <View style={[styles.pricingCard, styles.popularCard]}>
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>POPULAR</Text>
              </View>
              <Text style={styles.cardTitle}>Pro Subscription</Text>
              <Text style={styles.price}>£9.99/month</Text>
              <Text style={styles.cardDescription}>
                Unlimited swing analyses, progress tracking, and premium features
              </Text>
            </View>

            <Button
              title="Continue"
              variant="secondary"
              size="lg"
              fullWidth
              onPress={handleContinue}
            />

            <Text style={styles.note}>
              This is a demo - no actual payment required
            </Text>
          </View>
        </ScrollView>
    </View>
  );
}

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
  container: {
    flex: 1,
    flexShrink: 1,
    ...Platform.select({
      web: {
        overflow: 'auto',
      },
    }),
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    paddingBottom: spacing.massive,
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    fontWeight: '400',
    color: palette.accent.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: palette.accent.white,
    opacity: 0.9,
    marginBottom: spacing.xxxl,
    textAlign: 'center',
  },
  pricingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  popularCard: {
    borderColor: palette.secondary[500],
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: spacing.base,
    backgroundColor: palette.secondary[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  popularText: {
    ...typography.caption,
    color: palette.primary[900],
    fontWeight: '700',
  },
  cardTitle: {
    ...typography.h4,
    fontWeight: '400',
    color: palette.accent.white,
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.secondary[500],
    marginBottom: spacing.sm,
  },
  cardDescription: {
    ...typography.body,
    color: palette.accent.white,
    opacity: 0.9,
  },
  note: {
    ...typography.caption,
    color: palette.accent.white,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: spacing.base,
    fontStyle: 'italic',
  },
});
