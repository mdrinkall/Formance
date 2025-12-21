/**
 * ClubSelectionScreen
 * Select club used for the swing
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Animated } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { AnalysisStackParamList, ClubType } from '../../types/analysis';
import { spacing, typography } from '../../styles';
import { palette } from '../../theme/palette';

type Props = StackScreenProps<AnalysisStackParamList, 'ClubSelection'>;

interface ClubCategory {
  id: string;
  title: string;
  description: string;
  clubs: ClubType[];
  subcategories?: { title: string; clubs: ClubType[] }[];
}

const CLUB_CATEGORIES: ClubCategory[] = [
  {
    id: 'driver',
    title: 'Driver',
    description: 'Longest club, lowest loft (≈8–12°). Used primarily off the tee for maximum distance.',
    clubs: ['Driver (1-wood)'],
  },
  {
    id: 'fairway-woods',
    title: 'Fairway Woods',
    description: 'Used off the tee or fairway.',
    clubs: ['3-wood', '4-wood', '5-wood', '7-wood', '9-wood', '11-wood'],
  },
  {
    id: 'hybrids',
    title: 'Hybrids',
    description: 'Blend of iron + wood; easier to hit than long irons.',
    clubs: ['2-hybrid', '3-hybrid', '4-hybrid', '5-hybrid', '6-hybrid'],
  },
  {
    id: 'irons',
    title: 'Irons',
    description: 'Numbered irons for approach shots.',
    clubs: ['9-iron', '8-iron', '7-iron', '6-iron', '5-iron', '4-iron', '3-iron', '2-iron', '1-iron'],
  },
  {
    id: 'wedges',
    title: 'Wedges',
    description: 'High-lofted irons for short game precision.',
    clubs: ['Pitching Wedge (PW)', 'Gap Wedge (GW/AW)', 'Sand Wedge (SW)', 'Lob Wedge (LW)', 'Ultra-lob Wedge'],
  },
];

export default function ClubSelectionScreen({ route, navigation }: Props) {
  const { videoUrl } = route.params;
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleSelectClub = (club: ClubType) => {
    navigation.navigate('ShotShapeSelection', { videoUrl, selectedClub: club });
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
            <View style={[styles.progressDot, styles.progressDotActive]}>
              <Ionicons name="golf" size={12} color={palette.primary[900]} />
            </View>
            <Text style={[styles.progressLabel, styles.progressLabelActive]}>Club</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.progressDot} />
            <Text style={styles.progressLabel}>Shape</Text>
          </View>
        </View>
      </View>

      {/* Editorial Header */}
      <View style={styles.header}>
        <View style={styles.editorialHeader}>
          <View style={styles.headerAccent} />
          <View style={styles.headerContent}>
            <Text style={styles.headerLabel}>STEP 2</Text>
            <Text style={styles.title}>Select Your Club</Text>
            <Text style={styles.subtitle}>Choose the club you used for this swing</Text>
          </View>
        </View>

        {/* Beginner Tip */}
        <View style={styles.tipBadge}>
          <Ionicons name="information-circle" size={16} color={palette.secondary[500]} />
          <Text style={styles.tipBadgeText}>Recommended for beginners: 7-iron</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
          {CLUB_CATEGORIES.map((category) => {
            const isExpanded = expandedSections.has(category.id);

            return (
              <View key={category.id} style={styles.accordionSection}>
                <TouchableOpacity
                  style={[styles.accordionHeader, isExpanded && styles.accordionHeaderExpanded]}
                  onPress={() => toggleSection(category.id)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${category.title} - ${isExpanded ? 'Collapse' : 'Expand'}`}
                >
                  <LinearGradient
                    colors={
                      isExpanded
                        ? ['rgba(233, 229, 214, 0.15)', 'rgba(233, 229, 214, 0.08)']
                        : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.accordionGradient}
                  >
                    <View style={styles.accordionHeaderContent}>
                      <Text style={[styles.accordionTitle, isExpanded && styles.accordionTitleExpanded]}>
                        {category.title}
                      </Text>
                      <View style={[styles.chevronContainer, isExpanded && styles.chevronContainerExpanded]}>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color={isExpanded ? palette.secondary[500] : palette.accent.white}
                        />
                      </View>
                    </View>
                    <Text style={styles.accordionDescription}>{category.description}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.accordionContent}>
                    {category.subcategories ? (
                      category.subcategories.map((sub) => (
                        <View key={sub.title} style={styles.subcategorySection}>
                          <Text style={styles.subcategoryTitle}>{sub.title}</Text>
                          {sub.clubs.map((club) => (
                            <View key={club} style={styles.clubItemWrapper}>
                              <SelectionCard
                                label={club}
                                selected={false}
                                onPress={() => handleSelectClub(club)}
                                style={styles.clubItem}
                                labelStyle={styles.clubItemLabel}
                              />
                            </View>
                          ))}
                        </View>
                      ))
                    ) : (
                      category.clubs.map((club) => (
                        <View key={club} style={styles.clubItemWrapper}>
                          <SelectionCard
                            label={club}
                            selected={false}
                            onPress={() => handleSelectClub(club)}
                            style={styles.clubItem}
                            labelStyle={styles.clubItemLabel}
                          />
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })}
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
    marginBottom: spacing.base,
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
  tipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 229, 214, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(233, 229, 214, 0.25)',
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  tipBadgeText: {
    ...typography.caption,
    fontSize: 12,
    color: palette.accent.white,
    opacity: 0.9,
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
    paddingBottom: spacing.massive,
    flexGrow: 1,
  },
  accordionSection: {
    marginBottom: spacing.md,
  },
  accordionHeader: {
    borderRadius: 16,
    overflow: 'hidden',
    ...createShadow(
      {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      2,
      '0 2px 8px rgba(0, 0, 0, 0.15)'
    ),
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        },
      } as any,
    }),
  },
  accordionHeaderExpanded: {
    ...createShadow(
      {
        shadowColor: palette.secondary[500],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      3,
      '0 2px 12px rgba(233, 229, 214, 0.2)'
    ),
  },
  accordionGradient: {
    padding: spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  accordionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.accent.white,
    letterSpacing: -0.3,
    flex: 1,
  },
  accordionTitleExpanded: {
    color: palette.secondary[500],
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  chevronContainerExpanded: {
    backgroundColor: 'rgba(233, 229, 214, 0.2)',
  },
  accordionDescription: {
    ...typography.caption,
    fontSize: 13,
    color: palette.accent.white,
    opacity: 0.8,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  accordionContent: {
    paddingTop: spacing.md,
    paddingLeft: spacing.base,
  },
  subcategorySection: {
    marginBottom: spacing.md,
  },
  subcategoryTitle: {
    ...typography.label,
    fontWeight: '600',
    color: palette.accent.white,
    opacity: 0.9,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  clubItemWrapper: {
    marginBottom: spacing.xs,
  },
  clubItem: {
    paddingVertical: spacing.sm,
    minHeight: 48,
    marginBottom: 0,
  },
  clubItemLabel: {
    fontWeight: '400',
  },
});
