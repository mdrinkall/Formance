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
import mockAnalysis from '../../../mock-responses/analysis.json';
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

    // Simulate API call and save to Supabase
    const processAnalysis = async () => {
      try {
        // Simulate API delay (3 seconds)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // In production, this would be replaced with actual API call
        // const analysis = await fetchAnalysisFromAPI(videoUrl);
        const analysis = mockAnalysis;

        // Save to Supabase
        if (!user) {
          throw new Error('User not authenticated');
        }

        const recordingId = await saveRecording({
          userId: user.id,
          videoUrl,
          analysis,
          annotations: mockAnnotations,
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
        // Still navigate to results on error (for now)
        // In production, you might want to show an error screen
        fadeOut.value = withTiming(0, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        }, () => {
          navigation.replace('Results', {
            videoUrl,
            selectedClub,
            shotShape,
            recordingId: '',
          });
        });
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
        {/* Spinner */}
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
});
