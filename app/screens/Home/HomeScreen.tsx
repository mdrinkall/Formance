/**
 * HomeScreen
 * Main dashboard with editorial-inspired design
 * Features magazine-style layout, sophisticated typography, and premium aesthetics
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ImageBackground, Animated, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthContext } from '../../context/AuthContext';
import { useSubscriptionContext } from '../../context/SubscriptionContext';
import { supabase } from '../../services/supabase';

export default function HomeScreen() {
  const { user } = useAuthContext();
  const { isActive: hasActiveSubscription } = useSubscriptionContext();
  const navigation = useNavigation();
  const [hasData] = useState(false); // Change to true to see active state
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [latestRecording, setLatestRecording] = useState<any>(null);
  const [loadingRecording, setLoadingRecording] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Extract first name from user metadata or use default
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.fullName || 'there';
  const firstName = fullName.split(' ')[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [fadeAnim]);

  // Fetch most recent recording with analysis
  useEffect(() => {
    const fetchLatestRecording = async () => {
      if (!user) {
        setLoadingRecording(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('recordings')
          .select('*')
          .eq('user_id', user.id)
          .not('analysis', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" - not an actual error
          console.error('Error fetching latest recording:', error);
        }

        setLatestRecording(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoadingRecording(false);
      }
    };

    fetchLatestRecording();
  }, [user]);

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);

      // Get the user's session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        Alert.alert('Error', 'Please log in to subscribe');
        return;
      }

      // TODO: Replace with your actual Stripe price ID from Stripe Dashboard
      const STRIPE_PRICE_ID = 'price_1SgsUFA6KzcdvOtic8aJo9TW'; // Get this from Stripe Dashboard

      // Call the Edge Function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          price_id: STRIPE_PRICE_ID,
          success_url: 'http://localhost:8081/Tabs/Profile',
          cancel_url: 'http://localhost:8081/Tabs/Profile'
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

  return (
    <View style={styles.wrapper}>
      {/* Decorative background elements */}
      <View style={styles.backgroundDecor} pointerEvents="none">
        <LinearGradient
          colors={[palette.primary[50], 'transparent']}
          style={styles.backgroundGradient}
          pointerEvents="none"
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {hasData ? (
            <ActiveUserView
              username={firstName}
              navigation={navigation}
              latestRecording={latestRecording}
              loadingRecording={loadingRecording}
            />
          ) : (
            <EmptyStateView
              username={firstName}
              navigation={navigation}
              onSubscribe={handleSubscribe}
              isSubscribing={isSubscribing}
              hasActiveSubscription={hasActiveSubscription}
              latestRecording={latestRecording}
              loadingRecording={loadingRecording}
            />
          )}
        </Animated.View>

        {/* Footer Spacer */}
        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
}

// ==================== WORK ON THIS WEEK WIDGET ====================
function WorkOnThisWeekWidget({ recording, navigation }: { recording: any; navigation: any }) {
  if (!recording?.analysis?.primary_focus || !recording?.analysis?.recommended_drill) {
    return null;
  }

  const { primary_focus, recommended_drill } = recording.analysis;

  return (
    <TouchableOpacity
      style={styles.workWidget}
      activeOpacity={0.95}
      onPress={() => {
        if (recommended_drill.youtube_url) {
          Linking.openURL(recommended_drill.youtube_url);
        }
      }}
      accessibilityRole="button"
      accessibilityLabel="Work on this week"
    >
      <LinearGradient
        colors={[palette.secondary[500], '#F5F1E3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.workWidgetGradient}
      >
        <View style={styles.workWidgetHeader}>
          <View style={styles.workWidgetBadge}>
            <Ionicons name="flash" size={12} color={palette.secondary[500]} />
            <Text style={styles.workWidgetBadgeText}>This Week</Text>
          </View>
        </View>

        <Text style={styles.workWidgetTitle}>{primary_focus.focus_area}</Text>
        <Text style={styles.workWidgetDescription} numberOfLines={2}>
          {primary_focus.reason}
        </Text>

        <View style={styles.workWidgetDrill}>
          <View style={styles.workWidgetDrillIcon}>
            <Ionicons name="play-circle" size={20} color={palette.primary[900]} />
          </View>
          <View style={styles.workWidgetDrillInfo}>
            <Text style={styles.workWidgetDrillName}>{recommended_drill.name}</Text>
            <Text style={styles.workWidgetDrillFreq}>{recommended_drill.frequency}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={palette.primary[700]} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ==================== EMPTY STATE VIEW ====================
function EmptyStateView({
  username,
  navigation,
  onSubscribe,
  isSubscribing,
  hasActiveSubscription,
  latestRecording,
  loadingRecording,
}: {
  username: string;
  navigation: any;
  onSubscribe: () => void;
  isSubscribing: boolean;
  hasActiveSubscription: boolean;
  latestRecording: any;
  loadingRecording: boolean;
}) {
  return (
    <>
      {/* Work on This Week Widget */}
      {!loadingRecording && latestRecording && (
        <WorkOnThisWeekWidget recording={latestRecording} navigation={navigation} />
      )}

      {/* Section 1: Editorial Welcome Header */}
      <View style={styles.heroSection}>
        <View style={styles.welcomeHeader}>
          <View style={styles.greetingAccent} />
          <View style={styles.greetingContent}>
            <Text style={styles.greetingLabel}>WELCOME BACK</Text>
            <Text style={styles.greetingName}>{username}</Text>
          </View>
        </View>
        <Text style={styles.heroSubtitle}>Your journey to mastery continues</Text>
      </View>

      {/* Section 2: Premium Quick Actions Grid */}
      <View style={styles.quickActionsGrid}>
        <PremiumQuickAction
          icon="trophy"
          label="Compete"
          description="Join challenges"
          gradient={[palette.primary[700], palette.primary[500]]}
        />
        <PremiumQuickAction
          icon="analytics"
          label="Analyze"
          description="Track progress"
          gradient={[palette.primary[600], palette.primary[400]]}
        />
        <PremiumQuickAction
          icon="people"
          label="Community"
          description="Connect & learn"
          gradient={[palette.primary[500], palette.primary[300]]}
        />
        <PremiumQuickAction
          icon="book"
          label="Resources"
          description="Expert tips"
          gradient={[palette.primary[800], palette.primary[600]]}
        />
      </View>

      {/* Section 3: Featured Hero CTA */}
      <TouchableOpacity
        style={styles.heroCard}
        accessibilityRole="button"
        accessibilityLabel="Start your swing analysis"
        activeOpacity={0.95}
        onPress={() => navigation.navigate('Analysis')}
      >
        <ImageBackground
          source={{
            uri: 'https://twpouulzcwhhxhdilnbj.supabase.co/storage/v1/object/public/assets/widgets/rich-green-putting.jpg',
          }}
          style={styles.heroImageBackground}
          imageStyle={styles.heroImage}
        >
          {/* Sophisticated gradient overlay */}
          <LinearGradient
            colors={[
              'rgba(26, 77, 46, 0.3)',
              'transparent',
              'rgba(0, 0, 0, 0.85)',
            ]}
            locations={[0, 0.4, 1]}
            style={styles.heroOverlay}
          />

          {/* Content with editorial layout */}
          <View style={styles.heroContent}>
            <View style={styles.heroTag}>
              <View style={styles.heroTagDot} />
              <Text style={styles.heroTagText}>AI-POWERED</Text>
            </View>
            <Text style={styles.heroTitle}>Perfect Your Swing</Text>
            <Text style={styles.heroDescription}>
              Advanced biomechanical analysis powered by cutting-edge AI
            </Text>
            <View style={styles.heroArrow}>
              <Ionicons name="arrow-forward" size={24} color={palette.accent.white} />
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {/* Section 4: Editorial Community Section */}
      <View style={styles.editorialSection}>
        <View style={styles.editorialSectionHeader}>
          <View style={styles.sectionAccent} />
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.editorialSectionTitle}>Connect & Grow</Text>
            <Text style={styles.editorialSectionSubtitle}>
              Join golfers on the same journey
            </Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('Community', { openSearch: true })}
            accessibilityRole="button"
            accessibilityLabel="View all users and search for people"
          >
            <Text style={styles.seeAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={16} color={palette.primary[700]} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.communityScrollContent}
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <PremiumUserCard key={index} index={index} />
          ))}
        </ScrollView>
      </View>

      {/* Section 5: Premium Subscription Card - Only show if no active subscription */}
      {!hasActiveSubscription && (
        <TouchableOpacity
          style={styles.premiumCard}
          accessibilityRole="button"
          accessibilityLabel="Unlock premium features"
          activeOpacity={0.95}
          onPress={onSubscribe}
          disabled={isSubscribing}
        >
        <LinearGradient
          colors={[palette.primary[800], palette.primary[600], palette.primary[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumGradient}
        >
          {/* Decorative pattern overlay */}
          <View style={styles.premiumPattern}>
            <View style={styles.premiumCircle1} />
            <View style={styles.premiumCircle2} />
          </View>

          <View style={styles.premiumContent}>
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={16} color={palette.accent.white} />
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </View>
            <Text style={styles.premiumTitle}>Unlock Your Full Potential</Text>
            <Text style={styles.premiumDescription}>
              Advanced analytics, personalized coaching, and unlimited analysis
            </Text>
            <View style={styles.premiumFeatures}>
              <PremiumFeature text="Unlimited swing analysis" />
              <PremiumFeature text="AI coaching insights" />
              <PremiumFeature text="Pro drills library" />
            </View>
            <View style={styles.premiumCTA}>
              {isSubscribing ? (
                <ActivityIndicator size="small" color={palette.primary[900]} />
              ) : (
                <>
                  <Text style={styles.premiumCTAText}>Start Free Trial</Text>
                  <Ionicons name="arrow-forward" size={20} color={palette.primary[900]} />
                </>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
      )}
    </>
  );
}

// ==================== ACTIVE STATE VIEW ====================
function ActiveUserView({
  username,
  navigation,
  latestRecording,
  loadingRecording,
}: {
  username: string;
  navigation: any;
  latestRecording: any;
  loadingRecording: boolean;
}) {
  return (
    <>
      {/* Work on This Week Widget */}
      {!loadingRecording && latestRecording && (
        <WorkOnThisWeekWidget recording={latestRecording} navigation={navigation} />
      )}

      {/* Section 1: Personalized Welcome with Stats */}
      <View style={styles.activeHeroSection}>
        <View style={styles.welcomeHeader}>
          <View style={styles.greetingAccent} />
          <View style={styles.greetingContent}>
            <Text style={styles.greetingLabel}>WELCOME BACK</Text>
            <Text style={styles.greetingName}>{username}</Text>
          </View>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={18} color="#FF6B35" />
          <Text style={styles.streakText}>2 day streak</Text>
        </View>
      </View>

      {/* Section 2: Enhanced Swing Score Card */}
      <Card style={styles.premiumScoreCard}>
        <LinearGradient
          colors={[palette.primary[50], palette.background.light]}
          style={styles.scoreCardGradient}
        >
          <View style={styles.scoreCardHeader}>
            <View>
              <Text style={styles.scoreLabel}>YOUR SWING SCORE</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreValue}>82</Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
            </View>
            <View style={styles.scoreTrend}>
              <Ionicons name="trending-up" size={32} color={palette.primary[600]} />
              <Text style={styles.scoreTrendText}>+6</Text>
              <Text style={styles.scoreTrendLabel}>this week</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <PremiumMetricItem label="Tempo" value="Good" status="success" icon="pulse" />
            <PremiumMetricItem
              label="Club Path"
              value="Out-To-In"
              status="warning"
              icon="git-network"
            />
            <PremiumMetricItem
              label="Face Angle"
              value="Needs Work"
              status="error"
              icon="compass"
            />
          </View>
        </LinearGradient>
      </Card>

      {/* Section 3: Prominent Record CTA */}
      <TouchableOpacity
        style={styles.recordCTACard}
        activeOpacity={0.95}
        onPress={() => navigation.navigate('Analysis')}
      >
        <LinearGradient
          colors={[palette.primary[700], palette.primary[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.recordCTAGradient}
        >
          <Ionicons name="videocam" size={28} color={palette.accent.white} />
          <View style={styles.recordCTAContent}>
            <Text style={styles.recordCTATitle}>Record New Swing</Text>
            <Text style={styles.recordCTASubtitle}>Get instant AI feedback</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={32} color={palette.accent.white} />
        </LinearGradient>
      </TouchableOpacity>

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

// ==================== PREMIUM WIDGET COMPONENTS ====================

// Premium Quick Action with gradient
function PremiumQuickAction({
  icon,
  label,
  description,
  gradient,
}: {
  icon: string;
  label: string;
  description: string;
  gradient: string[];
}) {
  return (
    <TouchableOpacity
      style={styles.premiumQuickAction}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`${label} - ${description}`}
    >
      <LinearGradient colors={gradient} style={styles.premiumQuickActionGradient}>
        <Ionicons name={icon as any} size={24} color={palette.accent.white} />
        <Text style={styles.premiumQuickActionLabel}>{label}</Text>
        <Text style={styles.premiumQuickActionDescription}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Premium User Card with elegant design
function PremiumUserCard({ index }: { index: number }) {
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

  const scores = [87, 92, 78, 85, 90, 82, 88, 91, 79, 86];

  return (
    <TouchableOpacity style={styles.premiumUserCard} activeOpacity={0.9}>
      <View style={styles.premiumUserCardContent}>
        <View style={styles.premiumUserAvatar}>
          <LinearGradient
            colors={[palette.primary[600], palette.primary[400]]}
            style={styles.premiumUserAvatarGradient}
          >
            <Text style={styles.premiumUserInitials}>
              {names[index]
                .split(' ')
                .map(n => n[0])
                .join('')}
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.premiumUserInfo}>
          <Text style={styles.premiumUserName} numberOfLines={1}>
            {names[index]}
          </Text>
          <View style={styles.premiumUserStats}>
            <Ionicons name="trophy" size={12} color={palette.primary[600]} />
            <Text style={styles.premiumUserScore}>Score: {scores[index]}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.premiumFollowButton}>
          <Ionicons name="add-circle" size={20} color={palette.primary[700]} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// Premium Metric Item with icon
function PremiumMetricItem({
  label,
  value,
  status,
  icon,
}: {
  label: string;
  value: string;
  status: 'success' | 'warning' | 'error';
  icon: string;
}) {
  const statusConfig = {
    success: { color: palette.success, bg: palette.success + '15' },
    warning: { color: palette.warning, bg: palette.warning + '15' },
    error: { color: palette.error, bg: palette.error + '15' },
  };

  const config = statusConfig[status];

  return (
    <View style={[styles.premiumMetricItem, { backgroundColor: config.bg }]}>
      <View style={styles.premiumMetricHeader}>
        <Ionicons name={icon as any} size={18} color={config.color} />
        <Text style={styles.premiumMetricLabel}>{label}</Text>
      </View>
      <Text style={[styles.premiumMetricValue, { color: config.color }]}>{value}</Text>
    </View>
  );
}

// Premium Feature bullet point
function PremiumFeature({ text }: { text: string }) {
  return (
    <View style={styles.premiumFeature}>
      <View style={styles.premiumFeatureCheck}>
        <Ionicons name="checkmark" size={14} color={palette.accent.white} />
      </View>
      <Text style={styles.premiumFeatureText}>{text}</Text>
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

// ==================== PREMIUM STYLES ====================

// Helper for cross-platform shadows (avoids web deprecation warnings)
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
  // Base layout
  wrapper: {
    flex: 1,
    backgroundColor: palette.background.light,
  },
  backgroundDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    zIndex: 0,
  },
  backgroundGradient: {
    flex: 1,
    opacity: 0.4,
  },
  container: {
    flex: 1,
    zIndex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.massive,
  },
  footerSpacer: {
    height: spacing.massive,
  },

  // Hero Section (Welcome)
  heroSection: {
    marginBottom: spacing.xl,
  },
  activeHeroSection: {
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  greetingAccent: {
    width: 4,
    height: 48,
    backgroundColor: palette.primary[600],
    borderRadius: 2,
    marginRight: spacing.md,
  },
  greetingContent: {
    flex: 1,
  },
  greetingLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: palette.primary[700],
    marginBottom: spacing.xs - 2,
  },
  greetingName: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -0.8,
    color: palette.text.light.primary,
    lineHeight: 38,
    ...Platform.select({
      web: {
        textShadow: '0 2px 4px rgba(26, 77, 46, 0.08)',
      } as any,
    }),
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.light.secondary,
    letterSpacing: 0.2,
    marginLeft: spacing.md + 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35' + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35' + '30',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: spacing.xs,
  },

  // Premium Quick Actions Grid
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  premiumQuickAction: {
    flex: 1,
    minWidth: '47%',
    maxWidth: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    ...createShadow(
      {
        shadowColor: palette.primary[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      4,
      '0 4px 12px rgba(26, 77, 46, 0.15)'
    ),
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 16px rgba(26, 77, 46, 0.25)',
        },
      } as any,
    }),
  },
  premiumQuickActionGradient: {
    padding: spacing.base,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  premiumQuickActionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.accent.white,
    marginTop: spacing.sm,
    letterSpacing: 0.3,
  },
  premiumQuickActionDescription: {
    fontSize: 12,
    color: palette.accent.white,
    opacity: 0.9,
    marginTop: spacing.xs - 2,
  },

  // Hero Card (Main CTA)
  heroCard: {
    marginBottom: spacing.xl,
    borderRadius: 20,
    overflow: 'hidden',
    ...createShadow(
      {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      8,
      '0 8px 24px rgba(0, 0, 0, 0.25)'
    ),
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        ':hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
        },
      } as any,
    }),
  },
  heroImageBackground: {
    width: '100%',
    aspectRatio: 0.9,
    justifyContent: 'flex-end',
  },
  heroImage: {
    borderRadius: 20,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    padding: spacing.lg,
    zIndex: 1,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.accent.white,
    marginRight: spacing.sm,
  },
  heroTagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: palette.accent.white,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.accent.white,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  heroDescription: {
    fontSize: 15,
    color: palette.accent.white,
    lineHeight: 22,
    opacity: 0.95,
    paddingRight: spacing.massive, // Prevent overlap with arrow button
  },
  heroArrow: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Editorial Section Headers
  editorialSection: {
    marginBottom: spacing.xl,
  },
  editorialSectionHeader: {
    marginBottom: spacing.base,
  },
  sectionAccent: {
    width: 48,
    height: 3,
    backgroundColor: palette.primary[600],
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  sectionTitleContainer: {
    marginBottom: spacing.xs,
  },
  editorialSectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.text.light.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs - 2,
  },
  editorialSectionSubtitle: {
    fontSize: 14,
    color: palette.text.light.secondary,
    lineHeight: 20,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: palette.primary[50],
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.primary[700],
    marginRight: spacing.xs,
  },

  // Section Titles (simple)
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text.light.primary,
    letterSpacing: -0.3,
  },

  // Horizontal Scroll
  horizontalScroll: {
    marginBottom: spacing.base,
  },
  communityScrollContent: {
    paddingRight: spacing.base,
    paddingLeft: spacing.xs,
    paddingVertical: spacing.base, // Add vertical padding for shadow visibility
    gap: spacing.md,
  },
  horizontalScrollContent: {
    paddingRight: spacing.base,
    gap: spacing.md,
  },

  // Premium User Cards
  premiumUserCard: {
    width: 200,
    backgroundColor: palette.background.light,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.primary[100],
    ...createShadow(
      {
        shadowColor: palette.primary[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      3,
      '0 4px 12px rgba(26, 77, 46, 0.1)'
    ),
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ':hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 20px rgba(26, 77, 46, 0.15)',
        },
      } as any,
    }),
  },
  premiumUserCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  premiumUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  premiumUserAvatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumUserInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.accent.white,
  },
  premiumUserInfo: {
    flex: 1,
  },
  premiumUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.text.light.primary,
    marginBottom: spacing.xs - 2,
  },
  premiumUserStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumUserScore: {
    fontSize: 12,
    color: palette.text.light.secondary,
    marginLeft: spacing.xs - 2,
  },
  premiumFollowButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: palette.primary[50],
  },

  // Premium Subscription Card
  premiumCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: 20,
    overflow: 'hidden',
    ...createShadow(
      {
        shadowColor: palette.primary[900],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      8,
      '0 8px 24px rgba(26, 77, 46, 0.3)'
    ),
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
        ':hover': {
          transform: 'scale(1.02)',
        },
      } as any,
    }),
  },
  premiumGradient: {
    padding: spacing.lg,
    minHeight: 280,
    position: 'relative',
  },
  premiumPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  premiumCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -50,
    right: -30,
  },
  premiumCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: -40,
    left: -20,
  },
  premiumContent: {
    zIndex: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: palette.accent.white,
    marginLeft: spacing.xs,
  },
  premiumTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: palette.accent.white,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  premiumDescription: {
    fontSize: 15,
    color: palette.accent.white,
    lineHeight: 22,
    opacity: 0.95,
    marginBottom: spacing.lg,
  },
  premiumFeatures: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumFeatureCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  premiumFeatureText: {
    fontSize: 14,
    color: palette.accent.white,
    lineHeight: 20,
  },
  premiumCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.accent.white,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginTop: spacing.xs,
  },
  premiumCTAText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.primary[900],
  },

  // Premium Score Card (Active State)
  premiumScoreCard: {
    marginBottom: spacing.base,
    overflow: 'hidden',
  },
  scoreCardGradient: {
    padding: spacing.base,
    borderRadius: 16,
  },
  scoreCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: palette.primary[700],
    marginBottom: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: palette.primary[900],
    letterSpacing: -2,
  },
  scoreMax: {
    fontSize: 24,
    fontWeight: '600',
    color: palette.text.light.secondary,
    marginLeft: spacing.xs,
  },
  scoreTrend: {
    alignItems: 'center',
    backgroundColor: palette.background.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.primary[100],
  },
  scoreTrendText: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.primary[600],
    marginTop: spacing.xs - 2,
  },
  scoreTrendLabel: {
    fontSize: 11,
    color: palette.text.light.secondary,
    marginTop: spacing.xs - 2,
  },

  // Premium Metrics Grid
  metricsGrid: {
    gap: spacing.md,
  },
  premiumMetricItem: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  premiumMetricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  premiumMetricLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.text.light.primary,
    marginLeft: spacing.sm,
  },
  premiumMetricValue: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },

  // Record CTA Card (Active State)
  recordCTACard: {
    marginBottom: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    ...createShadow(
      {
        shadowColor: palette.primary[900],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      6,
      '0 6px 16px rgba(26, 77, 46, 0.25)'
    ),
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        ':hover': {
          transform: 'scale(1.02)',
        },
      } as any,
    }),
  },
  recordCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    minHeight: 72,
  },
  recordCTAContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  recordCTATitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.accent.white,
    letterSpacing: -0.3,
  },
  recordCTASubtitle: {
    fontSize: 13,
    color: palette.accent.white,
    opacity: 0.9,
    marginTop: spacing.xs - 2,
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

  // Work on This Week Widget
  workWidget: {
    marginBottom: spacing.xl,
    borderRadius: 20,
    overflow: 'hidden',
    ...createShadow(
      {
        shadowColor: palette.primary[900],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      6,
      '0 6px 16px rgba(26, 77, 46, 0.2)'
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
  workWidgetGradient: {
    padding: spacing.lg,
    minHeight: 160,
  },
  workWidgetHeader: {
    marginBottom: spacing.sm,
  },
  workWidgetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs - 2,
    backgroundColor: palette.primary[900],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 100,
  },
  workWidgetBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: palette.secondary[500],
    textTransform: 'uppercase',
  },
  workWidgetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.primary[900],
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  workWidgetDescription: {
    fontSize: 14,
    color: palette.primary[900],
    opacity: 0.85,
    lineHeight: 20,
    marginBottom: spacing.base,
  },
  workWidgetDrill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 77, 46, 0.1)',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(26, 77, 46, 0.15)',
  },
  workWidgetDrillIcon: {
    marginRight: spacing.sm,
  },
  workWidgetDrillInfo: {
    flex: 1,
  },
  workWidgetDrillName: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.primary[900],
    marginBottom: 2,
  },
  workWidgetDrillFreq: {
    fontSize: 12,
    color: palette.primary[900],
    opacity: 0.7,
  },
});
