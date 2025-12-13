/**
 * CaptureScreen
 * Camera interface for capturing swing videos
 * TODO: Implement camera functionality with expo-camera
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';

export default function CaptureScreen() {
  const navigation = useNavigation();

  // Navigate to Analysis screen immediately when this tab is opened
  useEffect(() => {
    navigation.navigate('Analysis' as never);
  }, [navigation]);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Camera View</Text>
        <Text style={styles.subtitle}>Redirecting to Analysis...</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background.dark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.h3,
    color: palette.accent.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: palette.text.dark.secondary,
  },
});
