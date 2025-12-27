/**
 * ComparisonSlot - Video slot for side-by-side swing comparison
 * Supports synchronized playback
 */

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';

interface Keyframe {
  timestamp: number;
  description: string;
}

interface Annotations {
  keyframes?: {
    [key: string]: Keyframe;
  };
}

interface ComparisonSlotProps {
  position: 'left' | 'right';
  videoUrl?: string;
  isActive: boolean;
  onActivate: () => void;
  onClear?: () => void;
  annotations?: Annotations;
}

export interface ComparisonSlotRef {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  getDuration: () => number;
  getCurrentPosition: () => number;
  isReady: () => boolean;
}

export const ComparisonSlot = forwardRef<ComparisonSlotRef, ComparisonSlotProps>(({
  position,
  videoUrl,
  isActive,
  onActivate,
  onClear,
  annotations,
}, ref) => {
  const videoRef = useRef<Video>(null);
  const [duration, setDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    play: async () => {
      if (videoRef.current && isReady) {
        await videoRef.current.playAsync();
      }
    },
    pause: async () => {
      if (videoRef.current) {
        await videoRef.current.pauseAsync();
      }
    },
    seekTo: async (position: number) => {
      if (videoRef.current && isReady) {
        const targetPosition = Math.max(0, Math.min(position, duration));
        await videoRef.current.setPositionAsync(targetPosition);
      }
    },
    setRate: async (rate: number) => {
      if (videoRef.current && isReady) {
        await videoRef.current.setRateAsync(rate, true);
      }
    },
    getDuration: () => duration,
    getCurrentPosition: () => currentPosition,
    isReady: () => isReady,
  }));

  // Reset state when video changes
  useEffect(() => {
    setCurrentPosition(0);
    setIsReady(false);
    setDuration(0);
  }, [videoUrl]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (status.durationMillis && !isReady) {
        setDuration(status.durationMillis);
        setIsReady(true);
      }
      setCurrentPosition(status.positionMillis || 0);
    }
  };

  const formatTimeWithMs = (milliseconds: number) => {
    const seconds = (milliseconds / 1000).toFixed(2);
    return `${seconds}s`;
  };

  // Determine current keyframe based on timestamp
  const getCurrentKeyframe = (): string | null => {
    if (!annotations?.keyframes) return null;

    const currentSeconds = currentPosition / 1000;

    // Sort keyframes by timestamp
    const sortedKeyframes = Object.entries(annotations.keyframes)
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    // Find the last keyframe that has passed
    for (let i = sortedKeyframes.length - 1; i >= 0; i--) {
      const [name, keyframe] = sortedKeyframes[i];
      if (currentSeconds >= keyframe.timestamp) {
        return name.split('_').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
    }

    return null;
  };

  const currentKeyframe = getCurrentKeyframe();

  if (!videoUrl) {
    return (
      <View style={styles.videoSlot}>
        <TouchableOpacity
          style={[
            styles.emptyContainer,
            isActive && styles.activeSlot,
          ]}
          onPress={onActivate}
          accessibilityRole="button"
          accessibilityLabel={`Select ${position} swing`}
        >
          <Ionicons
            name="videocam-outline"
            size={48}
            color={isActive ? palette.primary[700] : palette.primary[400]}
          />
          <Text style={[
            styles.emptyLabel,
            isActive && styles.activeLabel,
          ]}>
            {isActive ? 'Select from below' : `Select ${position === 'left' ? 'First' : 'Second'} Swing`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.videoSlot}>
      {/* Video Container */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode="contain"
          videoStyle={styles.videoStyle}
          shouldPlay={false}
          isMuted={true}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          useNativeControls={false}
        />

        {/* Video Info Overlay - Top Left */}
        <View style={styles.videoInfo}>
          <Text style={styles.timeLabel}>{formatTimeWithMs(currentPosition)}</Text>
          {currentKeyframe && (
            <Text style={styles.keyframeLabel}>{currentKeyframe}</Text>
          )}
        </View>

        {onClear && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel="Clear video"
          >
            <Ionicons name="close-circle" size={28} color={palette.accent.white} />
          </TouchableOpacity>
        )}

        {/* Position Label - Bottom Left */}
        <View style={styles.positionLabel}>
          <Text style={styles.positionText}>{position.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  videoSlot: {
    flex: 1,
    backgroundColor: '#000',
  },
  emptyContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: palette.primary[50],
    borderWidth: 2,
    borderColor: palette.primary[200],
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 300,
  },
  activeSlot: {
    borderColor: palette.primary[700],
    borderStyle: 'solid',
    backgroundColor: palette.primary[100],
  },
  emptyLabel: {
    ...typography.body,
    color: palette.primary[600],
    textAlign: 'center',
    marginTop: spacing.md,
    fontWeight: '500',
  },
  activeLabel: {
    color: palette.primary[900],
    fontWeight: '600',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: '#000',
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    flex: 1,
    alignSelf: 'stretch',
  },
  videoStyle: {
    width: '100%',
    height: '100%',
  },
  videoInfo: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.accent.white,
    fontVariant: ['tabular-nums'],
  },
  keyframeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.secondary[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  positionLabel: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  positionText: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.accent.white,
    letterSpacing: 0.5,
  },
});
