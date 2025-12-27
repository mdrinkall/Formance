/**
 * HistoryScreen - Swing Comparison Page
 * Side-by-side video comparison for swing analysis
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { useAuthContext } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { ComparisonSlot, ComparisonSlotRef } from '../../components/comparison/ComparisonSlot';
import { ClubFilter, ClubOption } from '../../components/comparison/ClubFilter';
import { VideoGrid, Recording } from '../../components/comparison/VideoGrid';

interface Keyframe {
  name: string;
  label: string;
  timestamp: number;
  description: string;
}

export default function HistoryScreen() {
  const { user } = useAuthContext();
  const leftSlotRef = useRef<ComparisonSlotRef>(null);
  const rightSlotRef = useRef<ComparisonSlotRef>(null);

  // State management
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeComparisonSlot, setActiveComparisonSlot] = useState<'left' | 'right' | null>(null);
  const [leftVideo, setLeftVideo] = useState<Recording | null>(null);
  const [rightVideo, setRightVideo] = useState<Recording | null>(null);
  const [clubFilter, setClubFilter] = useState<string | null>(null);

  // Synchronized playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [maxDuration, setMaxDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const animationFrameRef = useRef<number>();

  // Fetch recordings from Supabase with annotations
  useEffect(() => {
    const fetchRecordings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('recordings')
          .select('id, video_url, club_used, created_at, score, annotations')
          .eq('user_id', user.id)
          .not('video_url', 'is', null)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setRecordings(data || []);
      } catch (err) {
        console.error('Error fetching recordings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, [user]);

  // Calculate max duration when videos change
  useEffect(() => {
    if (leftSlotRef.current && rightSlotRef.current) {
      const leftDuration = leftSlotRef.current.getDuration();
      const rightDuration = rightSlotRef.current.getDuration();
      setMaxDuration(Math.max(leftDuration, rightDuration));
    }
  }, [leftVideo, rightVideo]);

  // Extract common keyframes from both videos
  const commonKeyframes: Keyframe[] = useMemo(() => {
    if (!leftVideo?.annotations?.keyframes || !rightVideo?.annotations?.keyframes) {
      return [];
    }

    const leftKeyframes = leftVideo.annotations.keyframes;
    const rightKeyframes = rightVideo.annotations.keyframes;

    // Find common keyframe names
    const commonKeys = Object.keys(leftKeyframes).filter(key =>
      rightKeyframes[key] !== undefined
    );

    // Create keyframe objects with friendly labels
    return commonKeys.map(key => ({
      name: key,
      label: key.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      timestamp: leftKeyframes[key].timestamp,
      description: leftKeyframes[key].description,
    }));
  }, [leftVideo, rightVideo]);

  // Calculate club options from recordings
  const clubOptions: ClubOption[] = useMemo(() => {
    const clubCounts = recordings.reduce((acc, recording) => {
      const club = recording.club_used || 'Unknown';
      acc[club] = (acc[club] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(clubCounts).map(([club, count]) => ({
      club,
      count,
    }));
  }, [recordings]);

  // Filter recordings by selected club
  const filteredRecordings = useMemo(() => {
    if (!clubFilter) return recordings;
    return recordings.filter(r => r.club_used === clubFilter);
  }, [recordings, clubFilter]);

  // Handle slot activation
  const handleActivateSlot = (slot: 'left' | 'right') => {
    setActiveComparisonSlot(slot);
  };

  // Handle video selection
  const handleSelectVideo = (recording: Recording) => {
    if (!activeComparisonSlot) return;

    // Prevent selecting the same video twice
    if (
      (activeComparisonSlot === 'left' && recording.id === rightVideo?.id) ||
      (activeComparisonSlot === 'right' && recording.id === leftVideo?.id)
    ) {
      return;
    }

    if (activeComparisonSlot === 'left') {
      setLeftVideo(recording);
    } else {
      setRightVideo(recording);
    }

    // Deactivate slot after selection
    setActiveComparisonSlot(null);
  };

  // Handle clearing a video slot
  const handleClearSlot = (slot: 'left' | 'right') => {
    if (slot === 'left') {
      setLeftVideo(null);
    } else {
      setRightVideo(null);
    }
    setIsPlaying(false);
    setCurrentPosition(0);
  };

  // Jump to keyframe
  const handleJumpToKeyframe = async (keyframeName: string) => {
    if (!leftVideo?.annotations?.keyframes || !rightVideo?.annotations?.keyframes) {
      return;
    }

    const leftKeyframe = leftVideo.annotations.keyframes[keyframeName];
    const rightKeyframe = rightVideo.annotations.keyframes[keyframeName];

    if (!leftKeyframe || !rightKeyframe) return;

    // Pause if playing
    if (isPlaying) {
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    // Convert seconds to milliseconds
    const leftTimestamp = leftKeyframe.timestamp * 1000;
    const rightTimestamp = rightKeyframe.timestamp * 1000;

    // Seek both videos to their respective keyframe timestamps
    if (leftSlotRef.current) {
      await leftSlotRef.current.seekTo(leftTimestamp);
    }
    if (rightSlotRef.current) {
      await rightSlotRef.current.seekTo(rightTimestamp);
    }

    // Update position to the average (for scrubber display)
    setCurrentPosition((leftTimestamp + rightTimestamp) / 2);
  };

  // Handle playback speed change
  const handleSpeedChange = async (rate: number) => {
    setPlaybackRate(rate);
    if (leftSlotRef.current) {
      await leftSlotRef.current.setRate(rate);
    }
    if (rightSlotRef.current) {
      await rightSlotRef.current.setRate(rate);
    }
  };

  // Synchronized play/pause
  const handlePlayPause = async () => {
    if (!leftSlotRef.current || !rightSlotRef.current) return;

    if (isPlaying) {
      await leftSlotRef.current.pause();
      await rightSlotRef.current.pause();
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      // Set rate before playing
      await leftSlotRef.current.setRate(playbackRate);
      await rightSlotRef.current.setRate(playbackRate);
      await leftSlotRef.current.play();
      await rightSlotRef.current.play();
      setIsPlaying(true);

      // Update position while playing
      const updatePosition = () => {
        if (leftSlotRef.current && rightSlotRef.current) {
          const leftPos = leftSlotRef.current.getCurrentPosition();
          const rightPos = rightSlotRef.current.getCurrentPosition();
          const avgPos = (leftPos + rightPos) / 2;
          setCurrentPosition(avgPos);

          if (avgPos >= maxDuration) {
            setIsPlaying(false);
            return;
          }
        }
        animationFrameRef.current = requestAnimationFrame(updatePosition);
      };
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    }
  };

  // Synchronized scrubbing
  const handleScrub = async (value: number) => {
    setCurrentPosition(value);

    if (leftSlotRef.current) {
      await leftSlotRef.current.seekTo(value);
    }
    if (rightSlotRef.current) {
      await rightSlotRef.current.seekTo(value);
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const bothVideosLoaded = leftVideo && rightVideo;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary[700]} />
        <Text style={styles.loadingText}>Loading your swings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Comparison Zone */}
      <View style={styles.comparisonZone}>
        <View style={styles.slotsContainer}>
          <ComparisonSlot
            ref={leftSlotRef}
            position="left"
            videoUrl={leftVideo?.video_url}
            isActive={activeComparisonSlot === 'left'}
            onActivate={() => handleActivateSlot('left')}
            onClear={leftVideo ? () => handleClearSlot('left') : undefined}
            annotations={leftVideo?.annotations}
          />

          <ComparisonSlot
            ref={rightSlotRef}
            position="right"
            videoUrl={rightVideo?.video_url}
            isActive={activeComparisonSlot === 'right'}
            onActivate={() => handleActivateSlot('right')}
            onClear={rightVideo ? () => handleClearSlot('right') : undefined}
            annotations={rightVideo?.annotations}
          />
        </View>

        {/* Keyframe Quick Jump Buttons */}
        {commonKeyframes.length > 0 && (
          <View style={styles.keyframesSection}>
            <Text style={styles.keyframesLabel}>Quick Jump to:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.keyframesScroll}
            >
              {commonKeyframes.map((keyframe) => (
                <TouchableOpacity
                  key={keyframe.name}
                  style={styles.keyframeButton}
                  onPress={() => handleJumpToKeyframe(keyframe.name)}
                  accessibilityRole="button"
                  accessibilityLabel={`Jump to ${keyframe.label}`}
                >
                  <Ionicons name="pin" size={14} color={palette.primary[900]} />
                  <Text style={styles.keyframeButtonText}>{keyframe.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Synchronized Playback Controls */}
        {bothVideosLoaded && (
          <View style={styles.syncControls}>
            <View style={styles.playbackHeader}>
              <Text style={styles.syncLabel}>Synchronized Playback</Text>
              <View style={styles.speedControls}>
                {[0.25, 0.5, 1, 2].map(rate => (
                  <TouchableOpacity
                    key={rate}
                    style={[
                      styles.speedButton,
                      playbackRate === rate && styles.speedButtonActive
                    ]}
                    onPress={() => handleSpeedChange(rate)}
                    accessibilityRole="button"
                    accessibilityLabel={`${rate}x speed`}
                  >
                    <Text style={[
                      styles.speedButtonText,
                      playbackRate === rate && styles.speedButtonTextActive
                    ]}>
                      {rate}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.playbackControls}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
                accessibilityRole="button"
                accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={32}
                  color={palette.accent.white}
                />
              </TouchableOpacity>

              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.syncSlider}
                  minimumValue={0}
                  maximumValue={maxDuration || 1}
                  value={currentPosition}
                  onSlidingStart={async () => {
                    if (isPlaying) {
                      await handlePlayPause();
                    }
                  }}
                  onSlidingComplete={handleScrub}
                  minimumTrackTintColor={palette.accent.white}
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor={palette.accent.white}
                />
                <Text style={styles.timeText}>
                  {formatTime(currentPosition)} / {formatTime(maxDuration)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {activeComparisonSlot && (
          <View style={styles.selectionHint}>
            <Text style={styles.selectionHintText}>
              Select a video from below to fill the {activeComparisonSlot} slot
            </Text>
          </View>
        )}
      </View>

      {/* Scrollable Content */}
      <View style={styles.scrollContentContainer}>
        {/* Filter Controls */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Your Swing Library</Text>
          {clubOptions.length > 0 && (
            <ClubFilter
              clubs={clubOptions}
              selectedClub={clubFilter}
              onSelectClub={setClubFilter}
            />
          )}
        </View>

        {/* Video Grid */}
        <VideoGrid
          recordings={filteredRecordings}
          onSelectVideo={handleSelectVideo}
          selectedLeftId={leftVideo?.id}
          selectedRightId={rightVideo?.id}
          activeSlot={activeComparisonSlot}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.background.light,
    gap: spacing.base,
  },
  loadingText: {
    ...typography.body,
    color: palette.text.light.secondary,
  },
  comparisonZone: {
    backgroundColor: '#000',
  },
  slotsContainer: {
    flexDirection: 'row',
  },
  keyframesSection: {
    backgroundColor: palette.primary[50],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderTopWidth: 1,
    borderTopColor: palette.primary[100],
  },
  keyframesLabel: {
    ...typography.caption,
    color: palette.text.light.secondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  keyframesScroll: {
    gap: spacing.sm,
    paddingRight: spacing.base,
  },
  keyframeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.accent.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.primary[200],
    minHeight: 44,
    ...Platform.select({
      web: { cursor: 'pointer' },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  keyframeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.primary[900],
  },
  syncControls: {
    backgroundColor: palette.primary[900],
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  playbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  syncLabel: {
    ...typography.label,
    color: palette.accent.white,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  speedControls: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  speedButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 44,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  speedButtonActive: {
    backgroundColor: palette.accent.white,
  },
  speedButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.accent.white,
  },
  speedButtonTextActive: {
    color: palette.primary[900],
  },
  sliderContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  timeText: {
    ...typography.caption,
    color: palette.accent.white,
    fontWeight: '600',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.primary[700],
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  syncSlider: {
    flex: 1,
    height: 40,
  },
  selectionHint: {
    backgroundColor: palette.primary[700],
    padding: spacing.md,
  },
  selectionHintText: {
    ...typography.body,
    color: palette.accent.white,
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollContentContainer: {
    padding: spacing.base,
  },
  filterSection: {
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.h4,
    color: palette.text.light.primary,
    marginBottom: spacing.md,
  },
});
