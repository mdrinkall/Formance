/**
 * ResultsScreen
 * Display golf swing analysis results
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Modal, Linking } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { Video, ResizeMode } from 'expo-av';
import { Button } from '../../components/ui/Button';
import { AnalysisStackParamList } from '../../types/analysis';
import { spacing, typography } from '../../styles';
import { palette } from '../../theme/palette';
import mockAnalysis from '../../../mock-responses/analysis.json';

type Props = StackScreenProps<AnalysisStackParamList, 'Results'>;

// Category colors for visual distinction
const CATEGORY_COLORS: Record<string, string> = {
  setup_posture: '#10B981', // Emerald
  backswing_mechanics: '#3B82F6', // Blue
  downswing_impact: '#F59E0B', // Amber
  balance_finish: '#EC4899', // Pink
  consistency_athleticism: '#8B5CF6', // Purple
};

// Helper to convert category key to readable title
const getCategoryTitle = (key: string): string => {
  const titles: Record<string, string> = {
    setup_posture: 'Setup & Posture',
    backswing_mechanics: 'Backswing',
    downswing_impact: 'Impact',
    balance_finish: 'Balance',
    consistency_athleticism: 'Consistency',
  };
  return titles[key] || key;
};

// Radial Arc Component
interface RadialArcProps {
  score: number;
  maxScore: number;
  index: number;
  total: number;
  radius: number;
  color: string;
}

const RadialArc: React.FC<RadialArcProps> = ({ score, maxScore, index, total, radius, color }) => {
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (circumference / total) - 8; // -8 for spacing
  const progress = (score / maxScore) * arcLength;
  const rotation = (360 / total) * index;

  return (
    <Circle
      cx="50%"
      cy="50%"
      r={radius}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeDasharray={`${progress} ${circumference}`}
      strokeDashoffset={-rotation * (circumference / 360)}
      strokeLinecap="round"
      opacity={0.9}
    />
  );
};

export default function ResultsScreen({ route, navigation }: Props) {
  const { videoUrl, selectedClub, shotShape } = route.params;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);

  const handleDone = () => {
    navigation.navigate('VideoUpload');
  };

  const handlePlayVideo = async () => {
    if (Platform.OS === 'web') {
      // On web, open video in new tab
      Linking.openURL(videoUrl);
    } else {
      // On mobile, present fullscreen video player
      if (videoRef.current) {
        await videoRef.current.presentFullscreenPlayer();
      }
    }
  };

  const categories = Object.entries(mockAnalysis.category_scores);
  const selectedCategoryData = selectedCategory
    ? mockAnalysis.category_scores[selectedCategory as keyof typeof mockAnalysis.category_scores]
    : null;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Hero Score Section */}
          <View style={styles.heroSection}>
            {/* Circular Score with Radial Indicators */}
            <View style={styles.scoreCircleContainer}>
              <Svg height={260} width={260} style={styles.svg}>
                {/* Background circle */}
                <Circle
                  cx="50%"
                  cy="50%"
                  r={105}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth={10}
                  fill="none"
                />

                {/* Radial arc segments for each category */}
                {categories.map(([key, value], index) => (
                  <RadialArc
                    key={key}
                    score={value.score}
                    maxScore={20}
                    index={index}
                    total={categories.length}
                    radius={105}
                    color={CATEGORY_COLORS[key]}
                  />
                ))}
              </Svg>

              {/* Score content overlaid on SVG */}
              <View style={styles.scoreContent}>
                <Text style={styles.scoreNumber}>{mockAnalysis.overall_score}</Text>
                <Text style={styles.scoreLabel}>{mockAnalysis.skill_level}</Text>
              </View>
            </View>

            {/* Subtext row */}
            <View style={styles.subtextRow}>
              <View style={styles.subtextItem}>
                <Ionicons name="golf" size={18} color={palette.secondary[500]} style={styles.subtextIcon} />
                <Text style={styles.subtextText}>{mockAnalysis.club_used}</Text>
              </View>
              <View style={styles.subtextDivider} />
              <View style={styles.subtextItem}>
                <Ionicons name="analytics" size={18} color={palette.secondary[500]} style={styles.subtextIcon} />
                <Text style={styles.subtextText}>{mockAnalysis.shot_shape}</Text>
              </View>
            </View>
          </View>

          {/* Section Divider */}
          <View style={styles.sectionDivider} />

          {/* Swing Video Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Swing</Text>
            <TouchableOpacity
              style={styles.videoCard}
              activeOpacity={1}
              onPress={handlePlayVideo}
            >
              <Video
                ref={videoRef}
                source={{ uri: videoUrl }}
                style={styles.video}
                resizeMode={ResizeMode.COVER}
                shouldPlay={false}
              />

              {/* Play button overlay - always visible */}
              <View style={styles.playButtonOverlay}>
                <View style={styles.playButton}>
                  <Ionicons name="play" size={40} color={palette.accent.white} />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Section Divider */}
          <View style={styles.sectionDivider} />

          {/* Category Breakdown Cards - Vertical List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            {categories.map(([key, value]) => {
              const progressPercent = (value.score / 20) * 100;

              return (
                <TouchableOpacity
                  key={key}
                  style={styles.categoryCard}
                  onPress={() => setSelectedCategory(key)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${getCategoryTitle(key)}, score ${value.score} out of 20`}
                >
                  <View style={styles.categoryContent}>
                    {/* Top row: dot, title, score */}
                    <View style={styles.categoryHeaderRow}>
                      <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[key] }]} />
                      <Text style={styles.categoryTitle}>{getCategoryTitle(key)}</Text>
                      <Text style={styles.categoryScore}>{value.score}</Text>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBackground}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${progressPercent}%`,
                              backgroundColor: CATEGORY_COLORS[key]
                            }
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Section Divider */}
          <View style={styles.sectionDivider} />

          {/* What Went Well */}
          <View style={styles.section}>
            <View style={styles.feedbackHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={[styles.sectionTitle, styles.inlineTitle]}>What Went Well</Text>
            </View>
            <View style={styles.feedbackCard}>
              {mockAnalysis.what_was_good.map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View style={[styles.bulletDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* What Needs Work */}
          <View style={styles.section}>
            <View style={styles.feedbackHeader}>
              <Ionicons name="alert-circle" size={24} color="#F59E0B" />
              <Text style={[styles.sectionTitle, styles.inlineTitle]}>What Needs Work</Text>
            </View>
            <View style={styles.feedbackCard}>
              {mockAnalysis.what_was_bad.map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View style={[styles.bulletDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Section Divider */}
          <View style={styles.sectionDivider} />

          {/* Immediate Focus Section */}
          <View style={styles.section}>
            <View style={styles.feedbackHeader}>
              <Ionicons name="flash" size={24} color="#EC4899" />
              <Text style={[styles.sectionTitle, styles.inlineTitle]}>Immediate Focus</Text>
            </View>
            {mockAnalysis.immediate_focus.map((focus, index) => (
              <View key={index} style={styles.focusCard}>
                <Text style={styles.focusIssue}>{focus.issue}</Text>

                <View style={styles.focusSection}>
                  <Text style={styles.focusLabel}>Why it matters</Text>
                  <Text style={styles.focusText}>{focus.why_it_matters}</Text>
                </View>

                <View style={styles.focusSection}>
                  <Text style={styles.focusLabel}>Simple fix</Text>
                  <Text style={styles.focusText}>{focus.simple_fix}</Text>
                </View>

                {/* Placeholder for future CTA */}
                <TouchableOpacity style={styles.focusCTAButton} activeOpacity={0.8}>
                  <Text style={styles.focusCTAText}>View Related Drill</Text>
                  <Ionicons name="arrow-forward" size={16} color={palette.primary[900]} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Confidence Note */}
          <View style={styles.confidenceSection}>
            <Ionicons name="information-circle-outline" size={16} color={palette.accent.white} style={{ opacity: 0.5 }} />
            <Text style={styles.confidenceText}>{mockAnalysis.confidence_note}</Text>
          </View>

          {/* Action Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Analyze Another Swing"
              variant="secondary"
              size="lg"
              fullWidth
              onPress={handleDone}
            />
          </View>
        </View>
      </ScrollView>

      {/* Category Detail Modal */}
      <Modal
        visible={selectedCategory !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCategory(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedCategory(null)}
        >
          <View style={styles.modalContent}>
            {selectedCategoryData && selectedCategory && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[selectedCategory] }]} />
                  <Text style={styles.modalTitle}>{getCategoryTitle(selectedCategory)}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(null)}
                    style={styles.modalClose}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Ionicons name="close" size={24} color={palette.accent.white} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalFeedback}>{selectedCategoryData.feedback}</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  },

  // Hero Score Section
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    paddingTop: spacing.lg,
  },
  scoreCircleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxxl,
    height: 260,
  },
  svg: {
    position: 'absolute',
  },
  scoreContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: '700',
    color: palette.accent.white,
    lineHeight: 72,
  },
  scoreLabel: {
    ...typography.label,
    fontSize: 16,
    color: palette.accent.white,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  subtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  subtextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subtextIcon: {
    opacity: 1,
  },
  subtextText: {
    ...typography.body,
    fontSize: 15,
    color: palette.accent.white,
    opacity: 0.9,
    textTransform: 'capitalize',
  },
  subtextDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Sections
  section: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.h4,
    fontWeight: '400',
    color: palette.accent.white,
    marginBottom: spacing.lg,
  },
  inlineTitle: {
    marginBottom: 0,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: spacing.xl,
    marginHorizontal: spacing.xl,
  },

  // Video Card
  videoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        cursor: 'pointer',
      },
    }),
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: palette.accent.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      },
    }),
  },

  // Category Cards
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: spacing.md,
    minHeight: 80,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  categoryContent: {
    flex: 1,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  categoryTitle: {
    ...typography.label,
    fontSize: 14,
    fontWeight: '400',
    color: palette.accent.white,
    flex: 1,
  },
  categoryScore: {
    fontSize: 24,
    fontWeight: '600',
    color: palette.accent.white,
    flexShrink: 0,
  },
  progressBarContainer: {
    marginTop: 'auto',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Feedback sections
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  feedbackCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: spacing.md,
  },
  bulletText: {
    ...typography.body,
    fontSize: 15,
    color: palette.accent.white,
    opacity: 0.9,
    lineHeight: 22,
    flex: 1,
  },

  // Immediate Focus Card
  focusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  focusIssue: {
    ...typography.h4,
    fontSize: 20,
    fontWeight: '500',
    color: palette.accent.white,
    marginBottom: spacing.lg,
  },
  focusSection: {
    marginBottom: spacing.lg,
  },
  focusLabel: {
    ...typography.label,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: palette.accent.white,
    opacity: 0.5,
    marginBottom: spacing.sm,
  },
  focusText: {
    ...typography.body,
    fontSize: 15,
    color: palette.accent.white,
    opacity: 0.95,
    lineHeight: 22,
  },
  focusCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.base,
    paddingVertical: spacing.base,
    backgroundColor: palette.secondary[500],
    borderRadius: 12,
    minHeight: 48,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  focusCTAText: {
    ...typography.label,
    fontSize: 15,
    fontWeight: '600',
    color: palette.primary[900],
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: palette.primary[800],
    borderRadius: 24,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: {
    ...typography.h4,
    fontSize: 20,
    fontWeight: '500',
    color: palette.accent.white,
    flex: 1,
  },
  modalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.lg,
  },
  modalScoreNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: palette.accent.white,
  },
  modalScoreLabel: {
    fontSize: 24,
    fontWeight: '400',
    color: palette.accent.white,
    opacity: 0.6,
    marginLeft: spacing.xs,
  },
  modalFeedback: {
    ...typography.body,
    fontSize: 16,
    color: palette.accent.white,
    opacity: 0.9,
    lineHeight: 24,
  },

  // Confidence Note
  confidenceSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.base,
    marginBottom: spacing.xl,
    padding: spacing.base,
  },
  confidenceText: {
    ...typography.caption,
    fontSize: 13,
    color: palette.accent.white,
    opacity: 0.6,
    lineHeight: 18,
    flex: 1,
  },

  // Button
  buttonContainer: {
    marginTop: spacing.base,
  },
});
