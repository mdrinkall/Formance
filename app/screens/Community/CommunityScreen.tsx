/**
 * CommunityScreen
 * Social features and community engagement
 * TODO: Implement community feed, challenges, leaderboards
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';

export default function CommunityScreen() {
  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>Community</Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Community Feed</Text>
          <Text style={styles.cardContent}>TODO: Display community posts and activity</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Challenges</Text>
          <Text style={styles.cardContent}>TODO: Display active challenges</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Friends Activity</Text>
          <Text style={styles.cardContent}>TODO: Display friends' recent rounds and achievements</Text>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.base,
  },
  cardTitle: {
    ...typography.h4,
    marginBottom: spacing.sm,
  },
  cardContent: {
    ...typography.body,
    color: palette.text.light.secondary,
  },
});
