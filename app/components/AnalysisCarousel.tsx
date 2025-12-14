/**
 * AnalysisCarousel
 * Horizontal scrollable carousel of swing analyses (Instagram stories style)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '../styles';
import { palette } from '../theme/palette';

interface Recording {
  id: string;
  score: number | null;
  club_used: string | null;
  created_at: string;
}

interface AnalysisCarouselProps {
  recordings: Recording[];
  onRecordingPress: (recordingId: string) => void;
  onNewPress?: () => void;
}

// Helper function to clean up club names
const cleanClubName = (clubName: string | null): string => {
  if (!clubName) return 'Unknown';
  // Remove anything in parentheses (e.g., "Driver (1-wood)" -> "Driver")
  return clubName.replace(/\s*\([^)]*\)/g, '').trim();
};

export const AnalysisCarousel: React.FC<AnalysisCarouselProps> = ({
  recordings,
  onRecordingPress,
  onNewPress,
}) => {
  // Recordings already come from DB in descending order (most recent first)
  // No need to reverse - just use them as-is

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Add New Analysis Card - Only show if onNewPress is provided */}
        {onNewPress && (
          <TouchableOpacity
            style={styles.storyContainer}
            onPress={onNewPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Record new swing"
          >
            <View style={styles.addBorder}>
              <View style={styles.addCircle}>
                <Ionicons name="add" size={32} color={palette.primary[900]} />
              </View>
            </View>
            <Text style={styles.clubLabel}>New</Text>
          </TouchableOpacity>
        )}

        {recordings.map((recording) => (
          <TouchableOpacity
            key={recording.id}
            style={styles.storyContainer}
            onPress={() => onRecordingPress(recording.id)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`View analysis with score ${recording.score || 'N/A'}`}
          >
            {/* Gradient Border (Instagram-like) */}
            <View style={styles.gradientBorder}>
              {/* Inner Circle */}
              <View style={styles.innerCircle}>
                {/* Score Display */}
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreNumber}>
                    {recording.score || '--'}
                  </Text>
                  <Ionicons name="golf" size={16} color={palette.primary[900]} />
                </View>
              </View>
            </View>

            {/* Club Label */}
            <Text style={styles.clubLabel} numberOfLines={1}>
              {cleanClubName(recording.club_used)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingRight: spacing.base,
    gap: spacing.md,
  },
  storyContainer: {
    alignItems: 'center',
    width: 80,
  },
  gradientBorder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    backgroundColor: palette.primary[900],
    marginBottom: spacing.xs,
  },
  innerCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    backgroundColor: palette.accent.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: palette.accent.white,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.primary[900],
    lineHeight: 28,
  },
  clubLabel: {
    ...typography.caption,
    fontSize: 12,
    color: palette.text.light.primary,
    textAlign: 'center',
  },
  addBorder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: palette.neutral[400],
    marginBottom: spacing.xs,
    backgroundColor: palette.neutral[100],
  },
  addCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    backgroundColor: palette.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
