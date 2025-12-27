/**
 * VideoGrid - Grid of recordings for comparison selection
 * Displays thumbnails, metadata, and selection state
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { Button } from '../ui/Button';

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
  const navigation = useNavigation();
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  // Generate thumbnails for all recordings
  useEffect(() => {
    const generateThumbnails = async () => {
      const newThumbnails: Record<string, string> = {};

      for (const recording of recordings) {
        // Skip if we already have a thumbnail for this recording
        if (thumbnails[recording.id]) {
          newThumbnails[recording.id] = thumbnails[recording.id];
          continue;
        }

        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(
            recording.video_url,
            {
              time: 1000, // 1 second into the video
            }
          );
          newThumbnails[recording.id] = uri;
        } catch (error) {
          console.warn(`Failed to generate thumbnail for ${recording.id}:`, error);
        }
      }

      setThumbnails(newThumbnails);
    };

    if (recordings.length > 0) {
      generateThumbnails();
    }
  }, [recordings]);

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

  const renderUploadCard = () => (
    <TouchableOpacity
      style={styles.uploadCard}
      onPress={() => navigation.navigate('Analysis' as never)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Upload more videos"
    >
      <View style={styles.uploadThumbnailContainer}>
        <View style={styles.uploadIconContainer}>
          <Ionicons name="cloud-upload-outline" size={32} color={palette.primary[700]} />
        </View>
      </View>
      <View style={styles.metadata}>
        <Text style={styles.uploadText}>Upload</Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item, index }: { item: Recording | { isUploadCard: true }; index: number }) => {
    // Render upload card
    if ('isUploadCard' in item && item.isUploadCard) {
      return renderUploadCard();
    }

    const recording = item as Recording;
    const selected = isSelected(recording.id);
    const badge = getSelectionBadge(recording.id);
    const selectable = canSelect(recording.id);

    return (
      <TouchableOpacity
        style={[
          styles.gridItem,
          selected && styles.selectedItem,
          !selectable && !selected && styles.disabledItem,
        ]}
        onPress={() => {
          if (selectable) {
            onSelectVideo(recording);
          }
        }}
        activeOpacity={selectable ? 0.7 : 1}
        accessibilityRole="button"
        accessibilityLabel={`Select swing from ${formatDate(recording.created_at)}`}
        disabled={!selectable && !selected}
      >
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          {thumbnails[recording.id] ? (
            <Image
              source={{ uri: thumbnails[recording.id] }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
              <Ionicons name="videocam" size={24} color={palette.primary[400]} />
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
            <Text style={styles.scoreText}>{recording.score}</Text>
          </View>
        </View>

        {/* Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metadataRow}>
            <Ionicons name="golf" size={12} color={palette.primary[700]} />
            <Text style={styles.clubText} numberOfLines={1}>
              {recording.club_used}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Ionicons name="calendar-outline" size={12} color={palette.text.light.secondary} />
            <Text style={styles.dateText} numberOfLines={1}>
              {formatDate(recording.created_at)}
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
        <Button
          title="Upload Swing & Analyze"
          variant="primary"
          onPress={() => navigation.navigate('Analysis' as never)}
          style={styles.uploadButton}
          icon={<Ionicons name="cloud-upload-outline" size={20} color={palette.accent.white} />}
        />
      </View>
    );
  }

  // Prepend upload card to recordings
  const dataWithUpload = [{ isUploadCard: true as const }, ...recordings];

  return (
    <FlatList
      data={dataWithUpload}
      renderItem={renderItem}
      keyExtractor={(item, index) => 'isUploadCard' in item ? 'upload-card' : (item as Recording).id}
      numColumns={3}
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
    gap: spacing.sm, // Reduced gap to prevent third item from cropping
    marginBottom: spacing.base,
  },
  gridItem: {
    width: '32.2%', // Fixed width for 3 columns to fill available space evenly
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
    margin: -1, // Negative margin to compensate for border width increase (3px - 2px)
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
    aspectRatio: 3 / 2, // Landscape aspect ratio - taller than before for better visibility
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
  uploadCard: {
    width: '32.2%', // Fixed width matching gridItem
    backgroundColor: palette.background.light,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: palette.primary[300],
    borderStyle: 'dashed',
    overflow: 'hidden',
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  uploadThumbnailContainer: {
    aspectRatio: 3 / 2, // Match video thumbnail aspect ratio
    backgroundColor: palette.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    ...typography.caption,
    fontSize: 12,
    color: palette.primary[700],
    fontWeight: '600',
    textAlign: 'center',
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
    padding: spacing.xs,
    gap: 2,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clubText: {
    ...typography.caption,
    fontSize: 11,
    color: palette.primary[700],
    fontWeight: '600',
    flex: 1,
  },
  dateText: {
    ...typography.caption,
    fontSize: 10,
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
    marginBottom: spacing.xl,
  },
  uploadButton: {
    minWidth: 220,
  },
});
