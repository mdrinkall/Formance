/**
 * ClubSelectionScreen
 * Select club used for the swing
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
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
      <View style={styles.header}>
        <Text style={styles.title}>What club are you using?</Text>
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
                  style={styles.accordionHeader}
                  onPress={() => toggleSection(category.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.accordionHeaderContent}>
                    <Text style={styles.accordionTitle}>{category.title}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={palette.accent.white}
                    />
                  </View>
                  <Text style={styles.accordionDescription}>{category.description}</Text>
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    flexShrink: 0,
  },
  title: {
    ...typography.h3,
    fontWeight: '400',
    color: palette.accent.white,
    textAlign: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  accordionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionTitle: {
    ...typography.h4,
    fontWeight: '500',
    color: palette.accent.white,
  },
  accordionDescription: {
    ...typography.caption,
    color: palette.accent.white,
    opacity: 0.7,
    marginTop: spacing.xs,
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
