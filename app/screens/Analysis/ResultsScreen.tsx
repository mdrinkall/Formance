/**
 * ResultsScreen
 * Display golf swing analysis results
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Modal, Linking } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { Video, ResizeMode } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { AnalysisStackParamList } from '../../types/analysis';
import { spacing, typography } from '../../styles';
import { palette } from '../../theme/palette';
import { getRecording } from '../../services/recordingService';
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

// Animated Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Animated Category Card Component
interface AnimatedCategoryCardProps {
  categoryKey: string;
  value: any;
  anim: {
    opacity: Animated.SharedValue<number>;
    translateY: Animated.SharedValue<number>;
    progressWidth: Animated.SharedValue<number>;
    yPosition: number;
  };
  onPress: () => void;
  onLayout: (y: number) => void;
}

const AnimatedCategoryCard: React.FC<AnimatedCategoryCardProps> = ({
  categoryKey,
  value,
  anim,
  onPress,
  onLayout,
}) => {
  const categoryCardAnimStyle = useAnimatedStyle(() => ({
    opacity: anim.opacity.value,
    transform: [{ translateY: anim.translateY.value }],
  }));

  const progressBarAnimStyle = useAnimatedStyle(() => ({
    width: `${anim.progressWidth.value}%`,
  }));

  const CATEGORY_COLORS: Record<string, string> = {
    setup_posture: '#10B981',
    backswing_mechanics: '#3B82F6',
    downswing_impact: '#F59E0B',
    balance_finish: '#EC4899',
    consistency_athleticism: '#8B5CF6',
  };

  return (
    <Animated.View
      style={categoryCardAnimStyle}
      onLayout={(event) => {
        const layout = event.nativeEvent.layout;
        onLayout(layout.y);
      }}
    >
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${getCategoryTitle(categoryKey)}, score ${value.score} out of 20`}
      >
        <View style={styles.categoryContent}>
          <View style={styles.categoryHeaderRow}>
            <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[categoryKey] }]} />
            <Text style={styles.categoryTitle}>{getCategoryTitle(categoryKey)}</Text>
            <Text style={styles.categoryScore}>{value.score}</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: CATEGORY_COLORS[categoryKey]
                  },
                  progressBarAnimStyle
                ]}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated Bullet Item Component
interface AnimatedBulletProps {
  text: string;
  color: string;
  opacity: Animated.SharedValue<number>;
  iconScale: Animated.SharedValue<number>;
}

const AnimatedBullet: React.FC<AnimatedBulletProps> = ({ text, color, opacity, iconScale }) => {
  const bulletStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <Animated.View style={[styles.bulletItem, bulletStyle]}>
      <Animated.View style={[styles.bulletDot, { backgroundColor: color }, dotStyle]} />
      <Text style={styles.bulletText}>{text}</Text>
    </Animated.View>
  );
};

// Radial Arc Component with Animation
interface RadialArcProps {
  score: number;
  maxScore: number;
  index: number;
  total: number;
  radius: number;
  color: string;
  animProgress: Animated.SharedValue<number>;
}

const RadialArc: React.FC<RadialArcProps> = ({ score, maxScore, index, total, radius, color, animProgress }) => {
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (circumference / total) - 8; // -8 for spacing
  const targetProgress = (score / maxScore) * arcLength;
  const rotation = (360 / total) * index;

  const animatedProps = useAnimatedProps(() => {
    const currentProgress = animProgress.value * targetProgress;
    return {
      strokeDasharray: `${currentProgress} ${circumference}`,
    };
  });

  return (
    <AnimatedCircle
      cx="50%"
      cy="50%"
      r={radius}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      animatedProps={animatedProps}
      strokeDashoffset={-rotation * (circumference / 360)}
      strokeLinecap="round"
      opacity={0.9}
    />
  );
};

export default function ResultsScreen({ route, navigation }: Props) {
  const { videoUrl, selectedClub, shotShape, recordingId } = route.params;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(mockAnalysis);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const videoRef = useRef<Video>(null);

  // Hero score entry animations
  const heroScale = useSharedValue(0.92);
  const heroOpacity = useSharedValue(0);
  const scoreOpacity = useSharedValue(0);
  const scoreTranslateY = useSharedValue(8);
  const labelOpacity = useSharedValue(0);
  const arcProgress = useSharedValue(0);

  // All content fades in after hero animation (no scroll-based)
  const contentOpacity = useSharedValue(0);

  // Get categories (after all hooks are defined)
  const categories = Object.entries(analysisData.category_scores);

  // Category cards animation - initialize with maximum expected categories (5)
  const categoryAnimations = useRef(
    Array.from({ length: 5 }, () => ({
      opacity: useSharedValue(0),
      translateY: useSharedValue(12),
      progressWidth: useSharedValue(0),
    }))
  ).current;

  // Bullet points animation - initialize with maximum expected items (10 each)
  const goodBulletAnimations = useRef(
    Array.from({ length: 10 }, () => ({
      opacity: useSharedValue(0),
      iconScale: useSharedValue(0.9),
    }))
  ).current;

  const badBulletAnimations = useRef(
    Array.from({ length: 10 }, () => ({
      opacity: useSharedValue(0),
      iconScale: useSharedValue(0.9),
    }))
  ).current;

  // Load analysis from database if we have a recordingId and it's from navigation (not from fresh analysis)
  useEffect(() => {
    const loadSavedAnalysis = async () => {
      if (recordingId) {
        try {
          setLoadingAnalysis(true);
          const recording = await getRecording(recordingId);
          if (recording?.analysis) {
            setAnalysisData(recording.analysis);
            console.log('Loaded saved analysis for recording:', recordingId);
          }
        } catch (error) {
          console.error('Error loading saved analysis:', error);
          // Fall back to mock data if there's an error
        } finally {
          setLoadingAnalysis(false);
        }
      }
    };

    loadSavedAnalysis();
  }, [recordingId]);

  useEffect(() => {
    // Phase 1: Container appears (300ms)
    heroOpacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });

    // Phase 2: Circle scales up and arcs draw (500-700ms)
    heroScale.value = withDelay(
      300,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      })
    );

    // Arcs draw sequentially with stagger
    arcProgress.value = withDelay(
      400,
      withTiming(1, {
        duration: 700,
        easing: Easing.out(Easing.quad),
      })
    );

    // Phase 3: Score number fades in with upward motion (the verdict moment)
    scoreOpacity.value = withDelay(
      900,
      withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      })
    );

    scoreTranslateY.value = withDelay(
      900,
      withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      })
    );

    // Phase 4: Labels fade in (150-250ms after score)
    labelOpacity.value = withDelay(
      1200,
      withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.quad),
      })
    );

    // Phase 5: All content (titles, dividers, sections) fade in after hero is complete
    contentOpacity.value = withDelay(
      1500,
      withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      })
    );

    // Category cards with stagger (starting at 1600ms)
    categoryAnimations.forEach((anim, index) => {
      const delay = 1600 + index * 80;

      anim.opacity.value = withDelay(
        delay,
        withTiming(1, {
          duration: 350,
          easing: Easing.out(Easing.quad),
        })
      );

      anim.translateY.value = withDelay(
        delay,
        withTiming(0, {
          duration: 350,
          easing: Easing.out(Easing.quad),
        })
      );

      const progressPercent = (categories[index][1].score / 20) * 100;
      anim.progressWidth.value = withDelay(
        delay + 120,
        withTiming(progressPercent, {
          duration: 600,
          easing: Easing.out(Easing.quad),
        })
      );
    });

    // Good bullets with stagger (starting at 1700ms)
    goodBulletAnimations.forEach((anim, index) => {
      const delay = 1700 + index * 70;

      anim.opacity.value = withDelay(
        delay,
        withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        })
      );

      anim.iconScale.value = withDelay(
        delay,
        withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        })
      );
    });

    // Bad bullets with stagger (starting at 1700ms)
    badBulletAnimations.forEach((anim, index) => {
      const delay = 1700 + index * 70;

      anim.opacity.value = withDelay(
        delay,
        withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        })
      );

      anim.iconScale.value = withDelay(
        delay,
        withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        })
      );
    });
  }, []);

  // Animated styles for hero section
  const heroContainerStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ scale: heroScale.value }],
  }));

  const scoreStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
    transform: [{ translateY: scoreTranslateY.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  // Animated styles for all content (titles, dividers, sections)
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleDone = () => {
    navigation.navigate('VideoUpload');
  };

  // Video modal state
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const modalVideoRef = useRef<Video>(null);

  const handleOpenVideoModal = () => {
    setIsVideoModalVisible(true);
  };

  const handleCloseVideoModal = async () => {
    // Pause video when closing modal
    if (modalVideoRef.current) {
      await modalVideoRef.current.pauseAsync();
    }
    setIsVideoModalVisible(false);
  };

  const selectedCategoryData = selectedCategory
    ? analysisData.category_scores[selectedCategory as keyof typeof analysisData.category_scores]
    : null;

  return (
    <View style={styles.wrapper}>
      {/* Progress Border */}
      <View style={styles.progressBorder} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Hero Score Section */}
          <View style={styles.heroSection}>
            {/* Circular Score with Radial Indicators */}
            <Animated.View style={[styles.scoreCircleContainer, heroContainerStyle]}>
              <Svg height={240} width={240} style={styles.svg}>
                {/* Background circle */}
                <Circle
                  cx="50%"
                  cy="50%"
                  r={95}
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
                    radius={95}
                    color={CATEGORY_COLORS[key]}
                    animProgress={arcProgress}
                  />
                ))}
              </Svg>

              {/* Score content overlaid on SVG */}
              <View style={styles.scoreContent}>
                <Animated.Text style={[styles.scoreNumber, scoreStyle]}>
                  {analysisData.overall_score}
                </Animated.Text>
                <Animated.Text style={[styles.scoreLabel, labelStyle]}>
                  {analysisData.skill_level}
                </Animated.Text>
              </View>
            </Animated.View>

            {/* Shot Details */}
            <Animated.View style={[styles.heroShotDetails, labelStyle]}>
              <View style={styles.heroShotItem}>
                <Ionicons name="golf" size={16} color={palette.accent.white} style={{ opacity: 0.6 }} />
                <Text style={styles.heroShotText}>{analysisData.club_used}</Text>
              </View>
              <View style={styles.heroShotDivider} />
              <View style={styles.heroShotItem}>
                <Ionicons name="analytics" size={16} color={palette.accent.white} style={{ opacity: 0.6 }} />
                <Text style={styles.heroShotText}>{analysisData.shot_shape}</Text>
              </View>
            </Animated.View>
          </View>

          {/* Primary Focus Section - CRITICAL */}
          {analysisData.primary_focus && (
            <View style={styles.section}>
              <Animated.Text style={[styles.primaryFocusTitle, contentStyle]}>
                Work on This Week
              </Animated.Text>
              <Animated.View style={[styles.primaryFocusCard, contentStyle]}>
                <View style={styles.primaryFocusHeader}>
                  <Text style={styles.primaryFocusIssue}>{analysisData.primary_focus.focus_area}</Text>
                  <View style={styles.primaryFocusBadge}>
                    <Text style={styles.primaryFocusBadgeText}>Priority #1</Text>
                  </View>
                </View>

                <View style={styles.primaryFocusContent}>
                  <Text style={styles.primaryFocusLabel}>Why this matters</Text>
                  <Text style={styles.primaryFocusText}>{analysisData.primary_focus.reason}</Text>
                </View>

                <View style={styles.primaryFocusCue}>
                  <Ionicons name="bulb-outline" size={16} color={palette.primary[700]} />
                  <Text style={styles.primaryFocusCueText}>{analysisData.primary_focus.simple_cue}</Text>
                </View>
              </Animated.View>
            </View>
          )}

          {/* Swing Video Card */}
          <View style={styles.section}>
            <Animated.Text style={[styles.sectionTitle, contentStyle]}>Your Swing</Animated.Text>
            <Animated.View style={contentStyle}>
              <TouchableOpacity
                style={styles.videoCard}
                activeOpacity={0.9}
                onPress={handleOpenVideoModal}
              >
                <Video
                  ref={videoRef}
                  source={{ uri: videoUrl }}
                  style={styles.videoThumbnail}
                  resizeMode="contain"
                  videoStyle={styles.videoInnerStyle}
                  shouldPlay={false}
                />
                {/* Play button overlay */}
                <View style={styles.playButtonOverlay}>
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={32} color={palette.accent.white} />
                  </View>
                  <Text style={styles.playButtonText}>Tap to watch</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* This Week's Work - Recommended Drill */}
          {analysisData.recommended_drill && (
            <View style={styles.sectionCompact}>
              <Animated.Text style={[styles.weeklyWorkTitle, contentStyle]}>
                This Week's Work
              </Animated.Text>
              <Animated.View style={[styles.weeklyWorkCard, contentStyle]}>
                <View style={styles.drillHeader}>
                  <Ionicons name="fitness" size={28} color={palette.secondary[500]} />
                  <View style={styles.drillHeaderText}>
                    <Text style={styles.drillName}>{analysisData.recommended_drill.name}</Text>
                    <Text style={styles.drillFrequency}>{analysisData.recommended_drill.frequency}</Text>
                  </View>
                </View>

                <Text style={styles.drillWhy}>{analysisData.recommended_drill.why}</Text>

                {/* YouTube Drill Link */}
                {analysisData.recommended_drill.youtube_url && (
                  <TouchableOpacity
                    style={styles.drillCTAButton}
                    activeOpacity={0.8}
                    onPress={() => Linking.openURL(analysisData.recommended_drill.youtube_url)}
                  >
                    <Ionicons name="play-circle" size={24} color={palette.primary[900]} />
                    <Text style={styles.drillCTAText}>Watch Drill</Text>
                  </TouchableOpacity>
                )}
              </Animated.View>
            </View>
          )}

          {/* Section Divider */}
          <Animated.View style={[styles.sectionDivider, contentStyle]} />

          {/* Category Breakdown - Simplified */}
          <View style={styles.sectionCompact}>
            <Animated.Text style={[styles.sectionTitle, contentStyle]}>Swing Breakdown</Animated.Text>
            <Animated.Text style={[styles.sectionSubtitle, contentStyle]}>
              Tap any category for detailed insights
            </Animated.Text>

            {categories.map(([key, value], index) => (
              <AnimatedCategoryCard
                key={key}
                categoryKey={key}
                value={value}
                anim={categoryAnimations[index]}
                onPress={() => setSelectedCategory(key)}
                onLayout={(y) => { }}
              />
            ))}
          </View>

          {/* Section Divider */}
          <Animated.View style={[styles.sectionDivider, contentStyle]} />

          {/* What Went Well - Brief */}
          <View style={styles.section}>
            <Animated.View style={[styles.feedbackHeader, contentStyle]}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={[styles.sectionTitleSmall, styles.inlineTitle]}>Strengths</Text>
            </Animated.View>
            <View style={styles.feedbackCardCompact}>
              {analysisData.what_was_good.slice(0, 3).map((item, index) => (
                <AnimatedBullet
                  key={index}
                  text={item}
                  color="#10B981"
                  opacity={goodBulletAnimations[index]?.opacity || useSharedValue(1)}
                  iconScale={goodBulletAnimations[index]?.iconScale || useSharedValue(1)}
                />
              ))}
            </View>
          </View>

          {/* What Needs Work - Supporting issues */}
          <View style={styles.section}>
            <Animated.View style={[styles.feedbackHeader, contentStyle]}>
              <Ionicons name="alert-circle" size={20} color="#F59E0B" />
              <Text style={[styles.sectionTitleSmall, styles.inlineTitle]}>Other Areas</Text>
            </Animated.View>
            <Animated.Text style={[styles.supportingNote, contentStyle]}>
              Focus on your priority first. These will improve naturally.
            </Animated.Text>
            <View style={styles.feedbackCardCompact}>
              {analysisData.what_needs_work.slice(0, 3).map((item, index) => (
                <AnimatedBullet
                  key={index}
                  text={item}
                  color="#F59E0B"
                  opacity={badBulletAnimations[index]?.opacity || useSharedValue(1)}
                  iconScale={badBulletAnimations[index]?.iconScale || useSharedValue(1)}
                />
              ))}
            </View>
          </View>

          {/* Confidence Note */}
          <Animated.View style={[styles.confidenceSection, contentStyle]}>
            <Ionicons name="information-circle-outline" size={16} color={palette.accent.white} style={{ opacity: 0.5 }} />
            <Text style={styles.confidenceText}>{analysisData.confidence_note}</Text>
          </Animated.View>

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

      {/* Video Player Modal */}
      <Modal
        visible={isVideoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseVideoModal}
      >
        <View style={styles.videoModalOverlay}>
          <View style={styles.videoModalContent}>
            {/* Close button */}
            <TouchableOpacity
              onPress={handleCloseVideoModal}
              style={styles.videoModalClose}
              accessibilityRole="button"
              accessibilityLabel="Close video"
            >
              <Ionicons name="close" size={28} color={palette.accent.white} />
            </TouchableOpacity>

            {/* Video player with controls */}
            <Video
              ref={modalVideoRef}
              source={{ uri: videoUrl }}
              style={styles.videoModalPlayer}
              resizeMode="contain"
              videoStyle={styles.videoInnerStyle}
              shouldPlay={true}
              useNativeControls
              isLooping
            />
          </View>
        </View>
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
  progressBorder: {
    height: 2,
    width: '100%',
    backgroundColor: palette.secondary[500],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 -2px 4px rgba(0,0,0,0.15)',
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
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  scoreCircleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    height: 240,
  },
  heroShotDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.base,
    marginTop: spacing.base,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 100,
    alignSelf: 'center',
  },
  heroShotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroShotText: {
    ...typography.body,
    fontSize: 13,
    color: palette.accent.white,
    opacity: 0.8,
    textTransform: 'capitalize',
  },
  heroShotDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
  subtextCard: {
    backgroundColor: palette.primary[950],
    borderRadius: 100,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: palette.primary[950],
    alignSelf: 'center',
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
  sectionCompact: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    fontWeight: '400',
    color: palette.accent.white,
    marginBottom: spacing.lg,
  },
  sectionTitleSmall: {
    ...typography.h4,
    fontSize: 18,
    fontWeight: '400',
    color: palette.accent.white,
    marginBottom: spacing.lg,
  },
  sectionSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: palette.accent.white,
    opacity: 0.6,
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
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

  // Video Card (thumbnail)
  videoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
    alignSelf: 'center',
    width: 200,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
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
  videoThumbnail: {
    flex: 1,
    alignSelf: 'stretch',
  },
  videoInnerStyle: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: palette.accent.white,
    marginBottom: spacing.sm,
  },
  playButtonText: {
    ...typography.label,
    fontSize: 12,
    color: palette.accent.white,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Video Modal
  videoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  videoModalContent: {
    width: '100%',
    height: '80%',
    maxWidth: 800,
    position: 'relative',
  },
  videoModalClose: {
    position: 'absolute',
    top: -50,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  videoModalPlayer: {
    flex: 1,
    alignSelf: 'stretch',
  },

  // Category Cards
  categoryTipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: palette.primary[950],
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: palette.primary[950],
  },
  categoryTipText: {
    ...typography.body,
    fontSize: 13,
    color: palette.accent.white,
    opacity: 0.9,
    flex: 1,
    lineHeight: 18,
  },
  categoryTipLabel: {
    fontWeight: '600',
    color: palette.secondary[500],
  },
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
  feedbackCardCompact: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  supportingNote: {
    ...typography.body,
    fontSize: 13,
    color: palette.accent.white,
    opacity: 0.6,
    marginBottom: spacing.md,
    fontStyle: 'italic',
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

  // Primary Focus Card - CRITICAL SECTION
  primaryFocusTitle: {
    ...typography.h3,
    fontSize: 24,
    fontWeight: '400',
    color: palette.accent.white,
    marginBottom: spacing.lg,
  },
  primaryFocusCard: {
    backgroundColor: palette.secondary[500],
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: palette.secondary[500],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
      },
    }),
  },
  primaryFocusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  primaryFocusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.primary[900],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 100,
    flexShrink: 0,
  },
  primaryFocusBadgeText: {
    ...typography.label,
    fontSize: 10,
    fontWeight: '600',
    color: palette.secondary[500],
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  primaryFocusIssue: {
    ...typography.h3,
    fontSize: 22,
    fontWeight: '600',
    color: palette.primary[900],
    lineHeight: 28,
    flex: 1,
    marginRight: spacing.sm,
  },
  primaryFocusContent: {
    marginBottom: spacing.base,
  },
  primaryFocusLabel: {
    ...typography.label,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: palette.primary[900],
    opacity: 0.7,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  primaryFocusText: {
    ...typography.body,
    fontSize: 15,
    color: palette.primary[900],
    lineHeight: 22,
    opacity: 0.9,
  },
  primaryFocusCue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(26, 77, 46, 0.2)',
  },
  primaryFocueCueText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '500',
    color: palette.primary[700],
    flex: 1,
    lineHeight: 20,
    opacity: 0.9,
  },

  // Weekly Work - Drill Card
  weeklyWorkTitle: {
    ...typography.h4,
    fontSize: 20,
    fontWeight: '400',
    color: palette.accent.white,
    marginBottom: spacing.lg,
  },
  weeklyWorkCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  drillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    marginBottom: spacing.base,
  },
  drillHeaderText: {
    flex: 1,
  },
  drillName: {
    ...typography.h4,
    fontSize: 18,
    fontWeight: '500',
    color: palette.accent.white,
    marginBottom: 2,
  },
  drillFrequency: {
    ...typography.body,
    fontSize: 13,
    color: palette.accent.white,
    opacity: 0.7,
  },
  drillWhy: {
    ...typography.body,
    fontSize: 15,
    color: palette.accent.white,
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  drillCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.base,
    backgroundColor: palette.secondary[500],
    borderRadius: 12,
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
        cursor: 'pointer',
      },
    }),
  },
  drillCTAText: {
    ...typography.label,
    fontSize: 16,
    fontWeight: '700',
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
    marginBottom: spacing.xxxl,
  },
});
