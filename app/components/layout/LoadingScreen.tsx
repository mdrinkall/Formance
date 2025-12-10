/**
 * LoadingScreen Component
 * Displays a loading state while checking auth
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';

export const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={palette.primary[900]} />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.background.light,
  },
  text: {
    ...typography.body,
    color: palette.text.dark.secondary,
    marginTop: spacing.base,
  },
});
