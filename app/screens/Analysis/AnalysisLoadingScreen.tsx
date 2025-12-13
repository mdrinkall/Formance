/**
 * AnalysisLoadingScreen
 * Loading animation while processing swing analysis
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AnalysisStackParamList } from '../../types/analysis';
import { spacing, typography } from '../../styles';
import { palette } from '../../theme/palette';

type Props = StackScreenProps<AnalysisStackParamList, 'Loading'>;

export default function AnalysisLoadingScreen({ route, navigation }: Props) {
  const { videoUrl, selectedClub, shotShape } = route.params;

  useEffect(() => {
    // Auto-navigate after 3 seconds
    const timeout = setTimeout(() => {
      navigation.replace('Results', { videoUrl, selectedClub, shotShape });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigation, videoUrl, selectedClub, shotShape]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={palette.secondary[500]} />
        <Text style={styles.title}>Analyzing your swing...</Text>
        <Text style={styles.subtitle}>
          Our AI is processing your video and generating personalized feedback
        </Text>
      </View>
    </View>
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
