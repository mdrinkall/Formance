/**
 * VideoGrid - Grid of recordings for comparison selection
 * Displays thumbnails, metadata, and selection state
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';

export interface Recording {
  id: string;
  video_url: string;
  club_used: string;
  created_at: string;
  score: number;
  thumbnail_url?: string;
  annotations?: {
    keyframes?: {
      [key: string]: {
        timestamp: number;
        description: string;
      };
    };
  };
}

interface VideoGridProps {
  recordings: Recording[];
  onSelectVideo: (recording: Recording) => void;
  selectedLeftId?: string;
  selectedRightId?: string;
  activeSlot: 'left' | 'right' | null;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  recordings,
  onSelectVideo,
  selectedLeftId,
  selectedRightId,
  activeSlot,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isSelected = (id: string) => {
    return id === selectedLeftId || id === selectedRightId;
  };

  const getSelectionBadge = (id: string) => {
    if (id === selectedLeftId) return 'Left';
    if (id === selectedRightId) return 'Right';
    return null;
  };

  const canSelect = (id: string) => {
    // Can't select the same video twice
    if (isSelected(id)) return false;
    // Can only select if a slot is active
    return activeSlot !== null;
  };

  const renderItem = ({ item }: { item: Recording }) => {
    const selected = isSelected(item.id);
    const badge = getSelectionBadge(item.id);
    const selectable = canSelect(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.gridItem,
          selected && styles.selectedItem,
          !selectable && !selected && styles.disabledItem,
        ]}
        onPress={() => {
          if (selectable) {
            onSelectVideo(item);
          }
        }}
        activeOpacity={selectable ? 0.7 : 1}
        accessibilityRole="button"
        accessibilityLabel={`Select swing from ${formatDate(item.created_at)}`}
        disabled={!selectable && !selected}
      >
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          {item.thumbnail_url ? (
            <Image
              source={{ uri: item.thumbnail_url }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
              <Ionicons name="videocam" size={32} color={palette.primary[400]} />
            </View>
          )}

          {/* Selection Badge */}
          {badge && (
            <View style={styles.selectionBadge}>
              <Text style={styles.selectionBadgeText}>{badge}</Text>
            </View>
          )}

          {/* Score Badge */}
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{item.score}</Text>
          </View>
        </View>

        {/* Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metadataRow}>
            <Ionicons name="golf" size={14} color={palette.primary[700]} />
            <Text style={styles.clubText} numberOfLines={1}>
              {item.club_used}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Ionicons name="calendar-outline" size={14} color={palette.text.light.secondary} />
            <Text style={styles.dateText} numberOfLines={1}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (recordings.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="golf-outline" size={64} color={palette.primary[300]} />
        <Text style={styles.emptyTitle}>No Swings Yet</Text>
        <Text style={styles.emptyDescription}>
          Record your first swing to start comparing
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={recordings}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.gridContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    paddingBottom: spacing.xl,
  },
  row: {
    gap: spacing.base,
    marginBottom: spacing.base,
  },
  gridItem: {
    flex: 1,
    backgroundColor: palette.background.light,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: palette.primary[100],
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    }),
  },
  selectedItem: {
    borderColor: palette.primary[700],
    borderWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: palette.primary[700],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
      web: { boxShadow: '0 4px 12px rgba(26, 77, 46, 0.3)' },
    }),
  },
  disabledItem: {
    opacity: 0.5,
  },
  thumbnailContainer: {
    position: 'relative',
    aspectRatio: 9 / 16,
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.primary[50],
  },
  selectionBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: palette.primary[700],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.accent.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.accent.white,
  },
  metadata: {
    padding: spacing.sm,
    gap: 4,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clubText: {
    ...typography.caption,
    fontSize: 13,
    color: palette.primary[700],
    fontWeight: '600',
    flex: 1,
  },
  dateText: {
    ...typography.caption,
    fontSize: 12,
    color: palette.text.light.secondary,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: palette.text.light.primary,
    marginTop: spacing.base,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    ...typography.body,
    color: palette.text.light.secondary,
    textAlign: 'center',
  },
});
