/**
 * AnalysisLoadingScreen
 * Loading animation while processing swing analysis
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { AnalysisStackParamList } from '../../types/analysis';
import { spacing, typography } from '../../styles';
import { palette } from '../../theme/palette';
import { useAuthContext } from '../../context/AuthContext';
import { saveRecording } from '../../services/recordingService';
import { supabase } from '../../services/supabase';
import mockAnnotations from '../../../mock-responses/annotations.json';

type Props = StackScreenProps<AnalysisStackParamList, 'Loading'>;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function AnalysisLoadingScreen({ route, navigation }: Props) {
  const { videoUrl, selectedClub, shotShape } = route.params;
  const { user } = useAuthContext();
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const rotation = useSharedValue(0);
  const fadeOut = useSharedValue(1);

  useEffect(() => {
    // Spinner rotation (smooth, continuous)
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );

    // Call Edge Functions to analyze swing and generate annotations
    const processAnalysis = async () => {
      try {
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Get user's auth token for authenticated Edge Function calls
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No active session');
        }

        // Fetch user context from database
        const [profileData, previousRecordingsData] = await Promise.all([
          // Get user's profile (handicap, swing_goal)
          supabase
            .from('profiles')
            .select('handicap, swing_goal')
            .eq('id', user.id)
            .single(),
          // Get last 3 recordings to get previous rankings
          supabase
            .from('recordings')
            .select('analysis')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3),
        ]);

        // Extract previous rankings from analysis data
        const previousRankings = previousRecordingsData.data
          ?.map((recording: any) => recording.analysis?.overall_score)
          .filter((score: number | undefined) => score !== undefined) || [];

        // Prepare user context for analysis
        const userContext = {
          user_handicap: profileData.data?.handicap || null,
          previous_rankings: previousRankings,
          previous_goals_summary: profileData.data?.swing_goal
            ? `User's current swing goal: ${profileData.data.swing_goal}`
            : 'No previous goals set',
        };

        // Call both Edge Functions in parallel
        const [analysisResponse, annotationsResponse] = await Promise.all([
          // Call analyze-swing function
          supabase.functions.invoke('analyze-swing', {
            body: {
              video_url: videoUrl,
              club_used: selectedClub,
              shot_shape: shotShape,
              user_context: userContext,
            },
          }),
          // We'll call generate-annotations after we get the primary_focus
          Promise.resolve(null), // Placeholder for now
        ]);

        // Check for errors in analysis
        if (analysisResponse.error) {
          console.error('Analysis function error:', analysisResponse.error);
          throw new Error(`Analysis failed: ${analysisResponse.error.message}`);
        }

        const analysis = analysisResponse.data;
        if (!analysis) {
          throw new Error('No analysis data returned');
        }

        // Now call generate-annotations with the primary_focus
        // COMMENTED OUT FOR MVP TO SAVE API CALLS - USING MOCK DATA INSTEAD
        // const annotationsResult = await supabase.functions.invoke('generate-annotations', {
        //   body: {
        //     video_url: videoUrl,
        //     primary_focus: analysis.primary_focus.focus_area,
        //   },
        // });

        // // Check for errors in annotations
        // if (annotationsResult.error) {
        //   console.error('Annotations function error:', annotationsResult.error);
        //   throw new Error(`Annotations failed: ${annotationsResult.error.message}`);
        // }

        // const annotations = annotationsResult.data;
        // if (!annotations) {
        //   throw new Error('No annotations data returned');
        // }

        // USE MOCK DATA FOR MVP
        const annotations = mockAnnotations;

        // Save to Supabase
        const recordingId = await saveRecording({
          userId: user.id,
          videoUrl,
          analysis,
          annotations,
          clubUsed: selectedClub,
          shotShape,
        });

        // Navigate to results with fade out
        fadeOut.value = withTiming(0, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        }, () => {
          navigation.replace('Results', {
            videoUrl,
            selectedClub,
            shotShape,
            recordingId,
          });
        });
      } catch (err) {
        console.error('Error processing analysis:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');

        // TODO: Show a proper error screen instead of navigating
        // For now, we'll just log the error and stay on this screen
        // The user will see the error message in the UI
      }
    };

    processAnalysis();
  }, [navigation, videoUrl, selectedClub, shotShape, user]);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeOut.value,
  }));

  return (
    <Animated.View style={[styles.wrapper, fadeStyle]}>
      <View style={styles.container}>
        {error ? (
          <>
            {/* Error State */}
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>✕</Text>
            </View>
            <Text style={styles.errorTitle}>Analysis Failed</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Text style={styles.errorSubtitle}>
              Please try again or contact support if the problem persists
            </Text>
          </>
        ) : (
          <>
            {/* Loading State */}
            <Animated.View style={[styles.spinnerContainer, spinnerStyle]}>
              <Svg width={60} height={60} viewBox="0 0 60 60">
                <Circle
                  cx="30"
                  cy="30"
                  r="25"
                  stroke={palette.secondary[500]}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="120 40"
                  strokeLinecap="round"
                />
              </Svg>
            </Animated.View>

            <Text style={styles.title}>Analyzing your swing...</Text>
            <Text style={styles.subtitle}>
              Our AI is processing your video and generating personalized feedback
            </Text>
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.primary[900],
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  spinnerContainer: {
    width: 60,
    height: 60,
    marginBottom: spacing.xxxl,
  },
  title: {
    ...typography.h3,
    color: palette.accent.white,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: palette.accent.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 3,
    borderColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  errorIconText: {
    fontSize: 40,
    color: '#ef4444',
    fontWeight: '600',
  },
  errorTitle: {
    ...typography.h3,
    color: palette.accent.white,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    ...typography.body,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  errorSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: palette.accent.white,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
