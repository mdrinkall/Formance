/**
 * HomeScreen
 * Main dashboard/home screen with personalized content
 * Features both empty state (no data) and active state (with data)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthContext } from '../../context/AuthContext';

export default function HomeScreen() {
  const { user } = useAuthContext();
  const navigation = useNavigation();
  const [hasData] = useState(false); // Change to true to see active state

  // Extract first name from user metadata or use default
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.fullName || 'there';
  const firstName = fullName.split(' ')[0];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {hasData ? <ActiveUserView username={firstName} navigation={navigation} /> : <EmptyStateView username={firstName} navigation={navigation} />}

        {/* Footer Spacer */}
        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
}

// ==================== EMPTY STATE VIEW ====================
function EmptyStateView({ username, navigation }: { username: string; navigation: any }) {
  return (
    <>
      {/* Section 1: Welcome Block */}
      <Card style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome back {username}</Text>
      </Card>

      {/* Section 2: Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <QuickActionCircle icon="trophy" label="Compete" />
        <QuickActionCircle icon="chatbubbles" label="Discuss" />
        <QuickActionCircle icon="book" label="Learn" />
        <QuickActionCircle icon="bar-chart" label="History" />
      </View>

      {/* Section 3: Main CTA */}
      <TouchableOpacity
        style={styles.recordCard}
        accessibilityRole="button"
        accessibilityLabel="Improve Your Rating - Record your swing"
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Analysis')}
      >
        <ImageBackground
          source={{ uri: 'https://twpouulzcwhhxhdilnbj.supabase.co/storage/v1/object/public/assets/widgets/rich-green-putting.jpg' }}
          style={styles.recordImageBackground}
          imageStyle={styles.recordImage}
        >
          {/* Gradient overlay - bottom 35% */}
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(0, 0, 0, 0.7)']}
            locations={[0, 0.65, 1]}
            style={styles.recordOverlay}
          />

          {/* Text content */}
          <View style={styles.recordTextContainer}>
            <Text style={styles.recordCardTitle}>IMPROVE YOUR RATING</Text>
            <Text style={styles.recordCardDescription}>
              Our state of the art insight tool can dissect your swing and help you improve instantly
            </Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {/* Section 4: Suggested For You */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Suggested For You</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.suggestedScrollContent}
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <SuggestedUserCard key={index} index={index} />
        ))}
      </ScrollView>

      {/* Section 5: Subscription Banner */}
      <TouchableOpacity
        style={styles.subscriptionBanner}
        accessibilityRole="button"
        accessibilityLabel="Subscribe to premium"
        activeOpacity={0.9}
      >
        <ImageBackground
          source={{ uri: 'https://twpouulzcwhhxhdilnbj.supabase.co/storage/v1/object/public/assets/widgets/record-your-swing.jpg' }}
          style={styles.subscriptionImageBackground}
          imageStyle={styles.subscriptionImage}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.6)']}
            locations={[0.5, 1]}
            style={styles.subscriptionOverlay}
          />
          <View style={styles.subscriptionTextContainer}>
            <Text style={styles.subscriptionTitle}>Go Premium</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </>
  );
}

// ==================== ACTIVE STATE VIEW ====================
function ActiveUserView({ username, navigation }: { username: string; navigation: any }) {
  return (
    <>
      {/* Section 1: Personalized Welcome */}
      <Card style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome back, {username}</Text>
      </Card>

      {/* Section 2: Swing Score Summary */}
      <Card style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <View>
            <Text style={styles.scoreLabel}>Your Swing Score</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreValue}>82</Text>
              <Text style={styles.scoreMax}>/100</Text>
              <View style={styles.scoreBadge}>
                <Ionicons name="arrow-up" size={16} color={palette.success} />
                <Text style={styles.scoreBadgeText}>+6 this week</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <MetricItem label="Tempo" value="Good" status="success" />
          <MetricItem label="Club Path" value="Slightly Out-To-In" status="warning" />
          <MetricItem label="Face Angle" value="Needs Work" status="error" />
        </View>
      </Card>

      {/* Section 3: Record CTA */}
      <Button
        title="Record New Swing"
        variant="primary"
        style={styles.recordCTA}
        onPress={() => navigation.navigate('Analysis')}
      />

      {/* Section 4: Personalized Drills */}
      <Text style={styles.sectionTitle}>Your Drills</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        <DrillCard title="Rotational Power" duration="5 min" />
        <DrillCard title="Early Extension" duration="7 min" />
        <DrillCard title="Hip-Bump Timing" duration="4 min" />
      </ScrollView>

      {/* Section 5: Latest Swing Analyses */}
      <Text style={styles.sectionTitle}>Recent Swings</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        <SwingCard score={85} date="2 days ago" />
        <SwingCard score={78} date="5 days ago" />
        <SwingCard score={82} date="1 week ago" />
      </ScrollView>

      {/* Section 6: Weekly Performance Insights */}
      <Card style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Ionicons name="sparkles" size={24} color={palette.primary[700]} />
          <Text style={styles.insightTitle}>AI Insight</Text>
        </View>
        <Text style={styles.insightText}>
          Rotation improved 12% this week
        </Text>
      </Card>

      {/* Section 7: Community Highlights */}
      <Text style={styles.sectionTitle}>Community</Text>
      <Card style={styles.communityHighlights}>
        <CommunityItem text="GolferXYZ +10 score" icon="trophy" />
        <CommunityItem text="CoachAdam: Hip mobility drill" icon="fitness" />
        <CommunityItem text="Trending: Rory tempo" icon="trending-up" />
      </Card>

      {/* Section 8: Goals & Streaks */}
      <Card style={styles.goalsCard}>
        <Text style={styles.goalsTitle}>Weekly Goal</Text>
        <Text style={styles.goalsProgress}>2/3 analyses</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
        <Text style={styles.streakText}>🔥 2 day streak</Text>
      </Card>
    </>
  );
}

// ==================== REUSABLE COMPONENTS ====================

function QuickActionCircle({ icon, label }: { icon: string; label: string }) {
  return (
    <TouchableOpacity style={styles.quickAction} activeOpacity={0.7}>
      <View style={styles.quickActionCircle}>
        <Ionicons name={icon as any} size={32} color={palette.accent.white} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function SuggestedUserCard({ index }: { index: number }) {
  const names = [
    'Alex Johnson',
    'Sarah Miller',
    'Mike Chen',
    'Emma Davis',
    'Chris Wilson',
    'Lisa Anderson',
    'Tom Brown',
    'Rachel Garcia',
    'David Lee',
    'Jessica Martinez',
  ];

  return (
    <View style={styles.suggestedUserCard}>
      <View style={styles.suggestedUserAvatar}>
        <Text style={styles.suggestedUserInitials}>
          {names[index].split(' ').map(n => n[0]).join('')}
        </Text>
      </View>
      <Text style={styles.suggestedUserName}>{names[index]}</Text>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Follow</Text>
      </TouchableOpacity>
    </View>
  );
}

function MetricItem({ label, value, status }: { label: string; value: string; status: 'success' | 'warning' | 'error' }) {
  const statusColors = {
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
  };

  return (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: statusColors[status] }]}>{value}</Text>
    </View>
  );
}

function DrillCard({ title, duration }: { title: string; duration: string }) {
  return (
    <Card style={styles.drillCard}>
      <Ionicons name="fitness-outline" size={24} color={palette.primary[900]} />
      <Text style={styles.drillTitle}>{title}</Text>
      <Text style={styles.drillDuration}>{duration}</Text>
    </Card>
  );
}

function SwingCard({ score, date }: { score: number; date: string }) {
  return (
    <Card style={styles.swingCard}>
      <View style={styles.swingThumbnail}>
        <Ionicons name="videocam" size={32} color={palette.text.light.secondary} />
      </View>
      <Text style={styles.swingScore}>Score: {score}/100</Text>
      <Text style={styles.swingDate}>{date}</Text>
    </Card>
  );
}

function CommunityItem({ text, icon }: { text: string; icon: string }) {
  return (
    <View style={styles.communityItem}>
      <Ionicons name={icon as any} size={20} color={palette.primary[700]} />
      <Text style={styles.communityItemText}>{text}</Text>
    </View>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.accent.white,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
  },
  footerSpacer: {
    height: spacing.xl,
  },

  // Welcome Card
  welcomeCard: {
    marginTop: 0,
    marginBottom: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    backgroundColor: palette.accent.white,
  },
  welcomeTitle: {
    ...typography.h4,
    textAlign: 'left',
  },
  welcomeSubtitle: {
    ...typography.body,
    color: palette.text.light.secondary,
  },

  // Record Card
  recordCard: {
    marginBottom: spacing.xl,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        cursor: 'pointer',
      },
    }),
  },
  recordImageBackground: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'flex-end',
  },
  recordImage: {
    borderRadius: 16,
  },
  recordOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  recordTextContainer: {
    padding: spacing.base,
    zIndex: 1,
  },
  recordCardTitle: {
    ...typography.label,
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: palette.accent.white,
    marginBottom: spacing.xs,
  },
  recordCardDescription: {
    ...typography.body,
    color: palette.accent.white,
    lineHeight: 22,
  },

  // Section Titles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.h4,
  },
  seeAllText: {
    ...typography.body,
    color: palette.primary[700],
  },

  // Horizontal Scroll
  horizontalScroll: {
    marginBottom: spacing.base,
  },
  horizontalScrollContent: {
    paddingRight: spacing.base,
    gap: spacing.base,
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.xl,
    paddingHorizontal: 0,
  },
  quickAction: {
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  quickActionCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.primary[900],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      },
    }),
  },
  quickActionLabel: {
    ...typography.caption,
    color: palette.text.light.primary,
  },

  // Suggested Users
  suggestedScrollContent: {
    paddingRight: spacing.base,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
  },
  suggestedUserCard: {
    width: 140,
    backgroundColor: palette.accent.white,
    borderRadius: 12,
    padding: spacing.base,
    marginRight: spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.neutral[200],
    flex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      },
    }),
  },
  suggestedUserAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.primary[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  suggestedUserInitials: {
    ...typography.h4,
    color: palette.primary[900],
  },
  suggestedUserName: {
    ...typography.label,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  followButton: {
    backgroundColor: palette.primary[900],
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
  },
  followButtonText: {
    ...typography.label,
    color: palette.accent.white,
    fontSize: 12,
  },

  // Subscription Banner
  subscriptionBanner: {
    marginTop: spacing.lg,
    marginBottom: spacing.base,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        cursor: 'pointer',
      },
    }),
  },
  subscriptionImageBackground: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'flex-end',
  },
  subscriptionImage: {
    borderRadius: 16,
  },
  subscriptionOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  subscriptionTextContainer: {
    padding: spacing.base,
    zIndex: 1,
  },
  subscriptionTitle: {
    ...typography.h3,
    color: palette.accent.white,
    marginBottom: spacing.xs,
  },
  subscriptionDescription: {
    ...typography.body,
    color: palette.accent.white,
  },

  // Empty States
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.base,
  },
  emptyTitle: {
    ...typography.h4,
    marginTop: spacing.base,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    ...typography.body,
    color: palette.text.light.secondary,
    textAlign: 'center',
  },

  // Community Card
  communityCard: {
    marginBottom: spacing.base,
    backgroundColor: palette.primary[50],
    borderLeftWidth: 4,
    borderLeftColor: palette.primary[700],
  },
  communityTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  communityDescription: {
    ...typography.body,
    color: palette.text.light.secondary,
  },

  // Score Card (Active State)
  scoreCard: {
    marginBottom: spacing.base,
    backgroundColor: palette.accent.white,
  },
  scoreHeader: {
    marginBottom: spacing.base,
  },
  scoreLabel: {
    ...typography.label,
    color: palette.text.light.secondary,
    marginBottom: spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    ...typography.h1,
    color: palette.primary[900],
  },
  scoreMax: {
    ...typography.h3,
    color: palette.text.light.secondary,
    marginLeft: spacing.xs,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginLeft: spacing.base,
  },
  scoreBadgeText: {
    ...typography.caption,
    color: palette.success,
    marginLeft: spacing.xs,
  },

  // Metrics Grid
  metricsGrid: {
    gap: spacing.base,
  },
  metricItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.light,
  },
  metricLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.body,
  },

  // Record CTA Button
  recordCTA: {
    marginBottom: spacing.base,
  },

  // Drill Cards
  drillCard: {
    width: 180,
    padding: spacing.base,
  },
  drillTitle: {
    ...typography.label,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  drillDuration: {
    ...typography.caption,
    color: palette.text.light.secondary,
  },

  // Swing Cards
  swingCard: {
    width: 140,
    padding: spacing.base,
    alignItems: 'center',
  },
  swingThumbnail: {
    width: 100,
    height: 80,
    backgroundColor: palette.neutral[200],
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  swingScore: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  swingDate: {
    ...typography.caption,
    color: palette.text.light.secondary,
  },

  // Insight Card
  insightCard: {
    marginBottom: spacing.base,
    backgroundColor: palette.primary[50],
    borderLeftWidth: 4,
    borderLeftColor: palette.primary[700],
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  insightTitle: {
    ...typography.label,
    marginLeft: spacing.sm,
  },
  insightText: {
    ...typography.body,
    fontStyle: 'italic',
    color: palette.text.light.primary,
  },

  // Community Highlights
  communityHighlights: {
    marginBottom: spacing.base,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.light,
  },
  communityItemText: {
    ...typography.body,
    marginLeft: spacing.sm,
    flex: 1,
  },

  // Goals Card
  goalsCard: {
    marginBottom: spacing.base,
  },
  goalsTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  goalsProgress: {
    ...typography.body,
    color: palette.text.light.secondary,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: palette.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.base,
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.primary[700],
    borderRadius: 4,
  },
  streakText: {
    ...typography.body,
    color: palette.primary[900],
  },
});
