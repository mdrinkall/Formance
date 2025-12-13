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
  const { videoUrl, selectedClub, shotShape } = route.params;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);

  // Get categories first (needed for animations initialization)
  const categories = Object.entries(mockAnalysis.category_scores);

  // Hero score entry animations
  const heroScale = useSharedValue(0.92);
  const heroOpacity = useSharedValue(0);
  const scoreOpacity = useSharedValue(0);
  const scoreTranslateY = useSharedValue(8);
  const labelOpacity = useSharedValue(0);
  const arcProgress = useSharedValue(0);

  // All content fades in after hero animation (no scroll-based)
  const contentOpacity = useSharedValue(0);

  // Category cards animation (staggered for visual interest)
  const categoryAnimations = useRef(
    categories.map(() => ({
      opacity: useSharedValue(0),
      translateY: useSharedValue(12),
      progressWidth: useSharedValue(0),
    }))
  ).current;

  // Bullet points animation (staggered)
  const goodBulletAnimations = useRef(
    mockAnalysis.what_was_good.map(() => ({
      opacity: useSharedValue(0),
      iconScale: useSharedValue(0.9),
    }))
  ).current;

  const badBulletAnimations = useRef(
    mockAnalysis.what_was_bad.map(() => ({
      opacity: useSharedValue(0),
      iconScale: useSharedValue(0.9),
    }))
  ).current;

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
            <Animated.View style={[styles.scoreCircleContainer, heroContainerStyle]}>
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
                    animProgress={arcProgress}
                  />
                ))}
              </Svg>

              {/* Score content overlaid on SVG */}
              <View style={styles.scoreContent}>
                <Animated.Text style={[styles.scoreNumber, scoreStyle]}>
                  {mockAnalysis.overall_score}
                </Animated.Text>
                <Animated.Text style={[styles.scoreLabel, labelStyle]}>
                  {mockAnalysis.skill_level}
                </Animated.Text>
              </View>
            </Animated.View>

            {/* Subtext row */}
            <Animated.View style={[styles.subtextRow, labelStyle]}>
              <View style={styles.subtextItem}>
                <Ionicons name="golf" size={18} color={palette.secondary[500]} style={styles.subtextIcon} />
                <Text style={styles.subtextText}>{mockAnalysis.club_used}</Text>
              </View>
              <View style={styles.subtextDivider} />
              <View style={styles.subtextItem}>
                <Ionicons name="analytics" size={18} color={palette.secondary[500]} style={styles.subtextIcon} />
                <Text style={styles.subtextText}>{mockAnalysis.shot_shape}</Text>
              </View>
            </Animated.View>
          </View>

          {/* Section Divider */}
          <Animated.View style={[styles.sectionDivider, contentStyle]} />

          {/* Swing Video Card */}
          <View style={styles.section}>
            <Animated.Text style={[styles.sectionTitle, contentStyle]}>Your Swing</Animated.Text>
            <Animated.View style={contentStyle}>
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
            </Animated.View>
          </View>

          {/* Section Divider */}
          <Animated.View style={[styles.sectionDivider, contentStyle]} />

          {/* Category Breakdown Cards - Vertical List */}
          <View style={styles.section}>
            <Animated.Text style={[styles.sectionTitle, contentStyle]}>Category Breakdown</Animated.Text>
            {categories.map(([key, value], index) => (
              <AnimatedCategoryCard
                key={key}
                categoryKey={key}
                value={value}
                anim={categoryAnimations[index]}
                onPress={() => setSelectedCategory(key)}
                onLayout={(y) => {}}
              />
            ))}
          </View>

          {/* Section Divider */}
          <Animated.View style={[styles.sectionDivider, contentStyle]} />

          {/* What Went Well */}
          <View style={styles.section}>
            <Animated.View style={[styles.feedbackHeader, contentStyle]}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={[styles.sectionTitle, styles.inlineTitle]}>What Went Well</Text>
            </Animated.View>
            <View style={styles.feedbackCard}>
              {mockAnalysis.what_was_good.map((item, index) => (
                <AnimatedBullet
                  key={index}
                  text={item}
                  color="#10B981"
                  opacity={goodBulletAnimations[index].opacity}
                  iconScale={goodBulletAnimations[index].iconScale}
                />
              ))}
            </View>
          </View>

          {/* What Needs Work */}
          <View style={styles.section}>
            <Animated.View style={[styles.feedbackHeader, contentStyle]}>
              <Ionicons name="alert-circle" size={24} color="#F59E0B" />
              <Text style={[styles.sectionTitle, styles.inlineTitle]}>What Needs Work</Text>
            </Animated.View>
            <View style={styles.feedbackCard}>
              {mockAnalysis.what_was_bad.map((item, index) => (
                <AnimatedBullet
                  key={index}
                  text={item}
                  color="#F59E0B"
                  opacity={badBulletAnimations[index].opacity}
                  iconScale={badBulletAnimations[index].iconScale}
                />
              ))}
            </View>
          </View>

          {/* Section Divider */}
          <Animated.View style={[styles.sectionDivider, contentStyle]} />

          {/* Immediate Focus Section */}
          <View style={styles.section}>
            <Animated.View style={[styles.feedbackHeader, contentStyle]}>
              <Ionicons name="flash" size={24} color="#EC4899" />
              <Text style={[styles.sectionTitle, styles.inlineTitle]}>Immediate Focus</Text>
            </Animated.View>
            {mockAnalysis.immediate_focus.map((focus, index) => (
              <Animated.View key={index} style={[styles.focusCard, contentStyle]}>
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
              </Animated.View>
            ))}
          </View>

          {/* Confidence Note */}
          <Animated.View style={[styles.confidenceSection, contentStyle]}>
            <Ionicons name="information-circle-outline" size={16} color={palette.accent.white} style={{ opacity: 0.5 }} />
            <Text style={styles.confidenceText}>{mockAnalysis.confidence_note}</Text>
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
