/**
 * OnboardingWrapper
 * Wrapper component for onboarding screens with progress bar and skip button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';

interface OnboardingWrapperProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  title: string;
  subtitle?: string;
  onSkip: () => void;
  children: React.ReactNode;
}

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({
  currentStep,
  totalSteps,
  stepLabel,
  title,
  subtitle,
  onSkip,
  children,
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

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

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
            </View>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              Step {currentStep} of {totalSteps}
            </Text>
            <TouchableOpacity
              onPress={onSkip}
              style={styles.skipButton}
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.editorialHeader}>
            <View style={styles.headerAccent} />
            <View style={styles.headerContent}>
              <Text style={styles.headerLabel}>{stepLabel}</Text>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    </View>
  );
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
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  progressSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.lg,
  },
  progressBarContainer: {
    marginBottom: spacing.sm,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(233, 229, 214, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: palette.secondary[500],
    borderRadius: 2,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    ...typography.caption,
    fontSize: 12,
    color: palette.accent.white,
    opacity: 0.8,
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  skipButtonText: {
    ...typography.body,
    fontSize: 14,
    color: palette.secondary[500],
    fontWeight: '400',
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  editorialHeader: {
    position: 'relative',
  },
  headerAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: palette.secondary[500],
    borderRadius: 2,
  },
  headerContent: {
    paddingLeft: spacing.base,
  },
  headerLabel: {
    ...typography.caption,
    fontSize: 11,
    color: palette.secondary[500],
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h2,
    fontSize: 28,
    color: palette.accent.white,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    fontSize: 15,
    color: palette.accent.white,
    opacity: 0.8,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
});
