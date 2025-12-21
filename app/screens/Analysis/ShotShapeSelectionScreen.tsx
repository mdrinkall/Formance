/**
 * ShotShapeSelectionScreen
 * Select desired shot shape
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AnalysisStackParamList, ShotShapeType } from '../../types/analysis';
import { spacing, typography } from '../../styles';
import { palette } from '../../theme/palette';

type Props = StackScreenProps<AnalysisStackParamList, 'ShotShapeSelection'>;

interface ShotShapeOption {
  type: ShotShapeType;
  description: string;
  icon: string;
}

const SHOT_SHAPES: ShotShapeOption[] = [
  {
    type: "I don't know",
    description: "Not sure about the intended ball flight pattern",
    icon: "help-circle",
  },
  {
    type: 'Straight',
    description: "Ball travels in a straight line with minimal curve",
    icon: "arrow-forward",
  },
  {
    type: 'Fade',
    description: "Ball curves gently from left to right (for right-handed)",
    icon: "return-down-forward",
  },
  {
    type: 'Draw',
    description: "Ball curves gently from right to left (for right-handed)",
    icon: "return-down-back",
  },
];

export default function ShotShapeSelectionScreen({ route, navigation }: Props) {
  const { videoUrl, selectedClub } = route.params;

  const handleSelectShape = (shape: ShotShapeType) => {
    navigation.navigate('Paywall', { videoUrl, selectedClub, shotShape: shape });
  };

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

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressSteps}>
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotComplete]}>
              <Ionicons name="checkmark" size={14} color={palette.primary[900]} />
            </View>
            <Text style={[styles.progressLabel, styles.progressLabelComplete]}>Video</Text>
          </View>
          <View style={[styles.progressLine, styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotComplete]}>
              <Ionicons name="checkmark" size={14} color={palette.primary[900]} />
            </View>
            <Text style={[styles.progressLabel, styles.progressLabelComplete]}>Club</Text>
          </View>
          <View style={[styles.progressLine, styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotActive]}>
              <Ionicons name="analytics" size={12} color={palette.primary[900]} />
            </View>
            <Text style={[styles.progressLabel, styles.progressLabelActive]}>Shape</Text>
          </View>
        </View>
      </View>

      {/* Editorial Header */}
      <View style={styles.header}>
        <View style={styles.editorialHeader}>
          <View style={styles.headerAccent} />
          <View style={styles.headerContent}>
            <Text style={styles.headerLabel}>STEP 3</Text>
            <Text style={styles.title}>Select Shot Shape</Text>
            <Text style={styles.subtitle}>What ball flight are you aiming for?</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
          {SHOT_SHAPES.map((shape, index) => (
            <TouchableOpacity
              key={shape.type}
              style={styles.shapeCard}
              onPress={() => handleSelectShape(shape.type)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`${shape.type} - ${shape.description}`}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.06)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.shapeGradient}
              >
                <View style={styles.shapeIconContainer}>
                  <LinearGradient
                    colors={[palette.secondary[500], palette.secondary[600]]}
                    style={styles.shapeIconGradient}
                  >
                    <Ionicons name={shape.icon as any} size={28} color={palette.primary[900]} />
                  </LinearGradient>
                </View>
                <View style={styles.shapeContent}>
                  <Text style={styles.shapeLabel}>{shape.type}</Text>
                  <Text style={styles.shapeDescription}>{shape.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={palette.accent.white} opacity={0.4} />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  progressContainer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  progressStep: {
    alignItems: 'center',
    gap: spacing.xs,
    flex: 0,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(233, 229, 214, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(233, 229, 214, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    backgroundColor: palette.secondary[500],
    borderColor: palette.secondary[500],
    ...createShadow(
      {
        shadowColor: palette.secondary[500],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      3,
      '0 2px 8px rgba(233, 229, 214, 0.4)'
    ),
  },
  progressDotComplete: {
    backgroundColor: palette.secondary[500],
    borderColor: palette.secondary[500],
    opacity: 0.6,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(233, 229, 214, 0.2)',
    marginHorizontal: spacing.base,
    marginTop: 15,
  },
  progressLineActive: {
    backgroundColor: palette.secondary[500],
  },
  progressLabel: {
    ...typography.caption,
    fontSize: 11,
    color: palette.accent.white,
    opacity: 0.6,
    fontWeight: '500',
  },
  progressLabelActive: {
    opacity: 1,
    color: palette.secondary[500],
    fontWeight: '600',
  },
  progressLabelComplete: {
    opacity: 0.7,
    color: palette.accent.white,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    flexShrink: 0,
    zIndex: 1,
  },
  editorialHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerAccent: {
    width: 4,
    height: 64,
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
    fontSize: 24,
    fontWeight: '600',
    color: palette.accent.white,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    fontSize: 14,
    color: palette.accent.white,
    opacity: 0.7,
    lineHeight: 20,
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.massive,
    flexGrow: 1,
    gap: spacing.md,
  },
  shapeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...createShadow(
      {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      4,
      '0 4px 12px rgba(0, 0, 0, 0.2)'
    ),
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
        },
      } as any,
    }),
  },
  shapeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    minHeight: 88,
  },
  shapeIconContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    marginRight: spacing.base,
  },
  shapeIconGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  shapeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.accent.white,
    marginBottom: spacing.xs - 2,
    letterSpacing: -0.3,
  },
  shapeDescription: {
    ...typography.caption,
    fontSize: 13,
    color: palette.accent.white,
    opacity: 0.8,
    lineHeight: 18,
  },
});
