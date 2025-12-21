/**
 * VideoUploadScreen
 * Select and upload swing video
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { AnalysisStackParamList } from '../../types/analysis';
import { uploadVideo } from '../../services/storageService';
import { useAuthContext } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { spacing, typography } from '../../styles';
import { palette } from '../../theme/palette';

type Props = StackScreenProps<AnalysisStackParamList, 'VideoUpload'>;

// Helper function to get video duration on web using HTML5 video element
const getVideoDuration = (uri: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
    };
    video.src = uri;
  });
};

// Helper function to generate thumbnail from video
const generateThumbnail = async (videoUrl: string): Promise<string | undefined> => {
  try {
    // On web, use canvas to extract first frame
    if (Platform.OS === 'web') {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.preload = 'metadata';
        video.currentTime = 0.1; // Seek to 0.1s to get first frame

        video.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
          video.remove();
          canvas.remove();
          resolve(thumbnailUrl);
        };

        video.onerror = () => {
          video.remove();
          resolve(undefined);
        };

        video.src = videoUrl;
      });
    } else {
      // On native, use expo-video-thumbnails
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUrl, {
        time: 100, // Get frame at 100ms
      });
      return uri;
    }
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return undefined;
  }
};

interface RecentVideo {
  name: string;
  url: string;
  created_at: string;
  thumbnail?: string;
}

export default function VideoUploadScreen({ navigation }: Props) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRecentVideos();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [fadeAnim]);

  const fetchRecentVideos = async () => {
    if (!user?.id) return;

    try {
      setLoadingRecent(true);
      const { data, error } = await supabase.storage
        .from('recordings')
        .list(user.id, {
          limit: 50,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      if (data) {
        const videosWithoutThumbnails = data.map(file => {
          const { data: urlData } = supabase.storage
            .from('recordings')
            .getPublicUrl(`${user.id}/${file.name}`);

          return {
            name: file.name,
            url: urlData.publicUrl,
            created_at: file.created_at || '',
          };
        });

        // Set videos first so they appear quickly
        setRecentVideos(videosWithoutThumbnails);

        // Generate thumbnails in the background
        const videosWithThumbnails = await Promise.all(
          videosWithoutThumbnails.map(async (video) => {
            const thumbnail = await generateThumbnail(video.url);
            return { ...video, thumbnail };
          })
        );

        setRecentVideos(videosWithThumbnails);
      }
    } catch (err) {
      console.error('Error fetching recent videos:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  const handleSelectRecentVideo = (videoUrl: string) => {
    navigation.navigate('ClubSelection', { videoUrl });
  };

  const handlePickVideo = async () => {
    try {
      setError(null);

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access media library is required');
        return;
      }

      // Launch picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      const videoUri = result.assets[0].uri;
      setSelectedVideo(videoUri);
      setLoading(true);

      // Validate duration (skip on web for now, or use HTML5 video element)
      if (Platform.OS !== 'web' && result.assets[0].duration) {
        const durationSeconds = result.assets[0].duration / 1000;
        if (durationSeconds > 10) {
          setError('Video must be under 10 seconds long. Please select a shorter video.');
          setLoading(false);
          setSelectedVideo(null);
          return;
        }
      }

      // On web, we can validate duration using HTML5 video
      if (Platform.OS === 'web') {
        try {
          const duration = await getVideoDuration(videoUri);
          if (duration > 10) {
            setError('Video must be under 10 seconds long. Please select a shorter video.');
            setLoading(false);
            setSelectedVideo(null);
            return;
          }
        } catch (err) {
          console.warn('Could not validate video duration:', err);
          // Continue anyway on web
        }
      }

      // Upload to Supabase
      if (!user?.id) {
        setError('You must be logged in to upload videos');
        setLoading(false);
        return;
      }

      const blob = await fetch(videoUri).then(r => r.blob());
      const videoUrl = await uploadVideo(blob, user.id);

      setLoading(false);

      // Navigate to next screen
      navigation.navigate('ClubSelection', { videoUrl });

    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to upload video');
      console.error('Video upload error:', err);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Decorative background elements */}
      <View style={styles.backgroundDecor} pointerEvents="none">
        <LinearGradient
          colors={[palette.primary[700], 'transparent']}
          style={styles.backgroundGradient}
          pointerEvents="none"
        />
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressSteps}>
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotActive]}>
              <Ionicons name="videocam" size={12} color={palette.primary[900]} />
            </View>
            <Text style={[styles.progressLabel, styles.progressLabelActive]}>Video</Text>
          </View>
          <View style={[styles.progressLine, styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <View style={styles.progressDot} />
            <Text style={styles.progressLabel}>Club</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.progressDot} />
            <Text style={styles.progressLabel}>Shape</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {selectedVideo && !error && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>Video selected! Uploading...</Text>
              </View>
            )}

            {/* Video Selection */}
            <View style={styles.recentSection}>
              {/* Editorial Header */}
              <View style={styles.editorialHeader}>
                <View style={styles.headerAccent} />
                <View style={styles.headerContent}>
                  <Text style={styles.headerLabel}>STEP 1</Text>
                  <Text style={styles.recentTitle}>Select Your Swing Video</Text>
                  <Text style={styles.headerSubtitle}>Choose from recent uploads or add a new video</Text>
                </View>
              </View>

              {/* Premium Tip Card */}
              <TouchableOpacity
                style={styles.tipCard}
                activeOpacity={0.95}
                accessibilityRole="button"
                accessibilityLabel="Pro tip for better analysis"
              >
                <LinearGradient
                  colors={[palette.secondary[500] + '20', palette.secondary[500] + '10']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tipGradient}
                >
                  <View style={styles.tipIconContainer}>
                    <Ionicons name="bulb" size={24} color={palette.secondary[500]} />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Pro Tip</Text>
                    <Text style={styles.tipText}>
                      Use slow-motion video to improve AI accuracy by over 70%
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {loadingRecent ? (
                <Text style={styles.loadingText}>Loading videos...</Text>
              ) : (
                <>
                  <View style={styles.videoGrid}>
                    {/* Upload New Video Card */}
                    <TouchableOpacity
                      style={styles.uploadCard}
                      onPress={handlePickVideo}
                      activeOpacity={0.8}
                      disabled={loading}
                      accessibilityRole="button"
                      accessibilityLabel="Upload new swing video"
                    >
                      <LinearGradient
                        colors={['rgba(233, 229, 214, 0.1)', 'rgba(233, 229, 214, 0.05)']}
                        style={styles.uploadCardGradient}
                      >
                        <View style={styles.uploadIconContainer}>
                          <LinearGradient
                            colors={[palette.secondary[500], palette.secondary[600]]}
                            style={styles.uploadIconGradient}
                          >
                            <Ionicons
                              name="add"
                              size={32}
                              color={palette.primary[900]}
                            />
                          </LinearGradient>
                        </View>
                        <Text style={styles.uploadCardText}>Upload New</Text>
                        <Text style={styles.uploadCardSubtext}>From camera roll</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Recent Videos */}
                    {(showAllVideos ? recentVideos : recentVideos.slice(0, 3)).map((video, index) => (
                      <TouchableOpacity
                        key={video.name}
                        style={styles.thumbnailCard}
                        onPress={() => handleSelectRecentVideo(video.url)}
                        activeOpacity={0.8}
                      >
                        {/* Thumbnail or fallback video icon */}
                        {video.thumbnail ? (
                          <Image
                            source={{ uri: video.thumbnail }}
                            style={styles.thumbnailImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.thumbnailContent}>
                            <Ionicons name="videocam" size={32} color={palette.accent.white} opacity={0.6} />
                          </View>
                        )}

                        {/* Date and time overlay at bottom */}
                        <LinearGradient
                          colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
                          style={styles.dateOverlay}
                        >
                          <Text style={styles.overlayDate}>
                            {new Date(video.created_at).toLocaleString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              month: 'short',
                              day: 'numeric',
                              hour12: false
                            })}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Show More Button */}
                  {recentVideos.length > 3 && (
                    <TouchableOpacity
                      style={styles.showMoreButton}
                      onPress={() => setShowAllVideos(!showAllVideos)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.showMoreText}>
                        {showAllVideos ? 'Show Less' : `Show More (${recentVideos.length - 3} more)`}
                      </Text>
                      <Ionicons
                        name={showAllVideos ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={palette.accent.white}
                      />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Helper for cross-platform shadows
const createShadow = (
  iosShadow: { shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number },
  androidElevation: number,
  webBoxShadow: string
) => {
  if (Platform.OS === 'web') {
    return { boxShadow: webBoxShadow };
  } else if (Platform.OS === 'android') {
    return { elevation: androidElevation };
  } else {
    return iosShadow;
  }
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.primary[900],
    ...Platform.select({
      web: {
        height: '100vh',
        maxHeight: '100vh',
      },
    }),
  },
  backgroundDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 500,
    zIndex: 0,
    overflow: 'hidden',
  },
  backgroundGradient: {
    flex: 1,
    opacity: 0.3,
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(233, 229, 214, 0.03)',
    top: -100,
    right: -50,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(233, 229, 214, 0.02)',
    top: 200,
    left: -30,
  },
  progressContainer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  progressStep: {
    alignItems: 'center',
    gap: spacing.xs,
    flex: 0,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(233, 229, 214, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(233, 229, 214, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    backgroundColor: palette.secondary[500],
    borderColor: palette.secondary[500],
    ...createShadow(
      {
        shadowColor: palette.secondary[500],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      3,
      '0 2px 8px rgba(233, 229, 214, 0.4)'
    ),
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(233, 229, 214, 0.2)',
    marginHorizontal: spacing.base,
    marginTop: 15,
  },
  progressLineActive: {
    backgroundColor: palette.secondary[500],
  },
  progressLabel: {
    ...typography.caption,
    fontSize: 11,
    color: palette.accent.white,
    opacity: 0.6,
    fontWeight: '500',
  },
  progressLabelActive: {
    opacity: 1,
    color: palette.secondary[500],
    fontWeight: '600',
  },
  container: {
    flex: 1,
    flexShrink: 1,
    ...Platform.select({
      web: {
        overflow: 'auto',
      },
    }),
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    paddingBottom: spacing.massive,
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    ...typography.body,
    color: palette.accent.white,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: 'rgba(65, 169, 101, 0.2)',
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(65, 169, 101, 0.3)',
  },
  successText: {
    ...typography.body,
    color: palette.accent.white,
    textAlign: 'center',
  },
  recentSection: {
    marginTop: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  editorialHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  headerAccent: {
    width: 4,
    height: 64,
    backgroundColor: palette.secondary[500],
    borderRadius: 2,
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: palette.secondary[500],
    marginBottom: spacing.xs - 2,
  },
  recentTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: palette.accent.white,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: palette.accent.white,
    opacity: 0.7,
    lineHeight: 20,
  },
  tipCard: {
    marginBottom: spacing.xl,
    borderRadius: 16,
    overflow: 'hidden',
    ...createShadow(
      {
        shadowColor: palette.secondary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      4,
      '0 4px 12px rgba(233, 229, 214, 0.15)'
    ),
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        ':hover': {
          transform: 'translateY(-2px)',
        },
      } as any,
    }),
  },
  tipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(233, 229, 214, 0.25)',
    borderRadius: 16,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(233, 229, 214, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: palette.secondary[500],
    marginBottom: spacing.xs - 2,
  },
  tipText: {
    ...typography.body,
    fontSize: 14,
    color: palette.accent.white,
    opacity: 0.9,
    lineHeight: 20,
  },
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  uploadCard: {
    width: '48%',
    aspectRatio: 9 / 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...createShadow(
      {
        shadowColor: palette.secondary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      4,
      '0 4px 12px rgba(233, 229, 214, 0.2)'
    ),
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ':hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 20px rgba(233, 229, 214, 0.3)',
        },
      } as any,
    }),
  },
  uploadCardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(233, 229, 214, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  uploadIconContainer: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  uploadIconGradient: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCardText: {
    ...typography.label,
    fontSize: 16,
    color: palette.accent.white,
    fontWeight: '500',
  },
  uploadCardSubtext: {
    ...typography.caption,
    fontSize: 12,
    color: palette.accent.white,
    opacity: 0.7,
    fontWeight: '400',
  },
  thumbnailCard: {
    width: '48%',
    aspectRatio: 9 / 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
    ...createShadow(
      {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      4,
      '0 4px 12px rgba(0, 0, 0, 0.3)'
    ),
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ':hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
        },
      } as any,
    }),
  },
  thumbnailContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 77, 46, 0.3)',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  overlayDate: {
    ...typography.caption,
    color: palette.accent.white,
    fontWeight: '400',
    textAlign: 'left',
  },
  loadingText: {
    ...typography.body,
    color: palette.accent.white,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(233, 229, 214, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(233, 229, 214, 0.25)',
    ...createShadow(
      {
        shadowColor: palette.secondary[500],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      2,
      '0 2px 8px rgba(233, 229, 214, 0.1)'
    ),
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
          backgroundColor: 'rgba(233, 229, 214, 0.15)',
          borderColor: 'rgba(233, 229, 214, 0.35)',
        },
      } as any,
    }),
  },
  showMoreText: {
    ...typography.label,
    fontSize: 14,
    fontWeight: '600',
    color: palette.accent.white,
    marginRight: spacing.sm,
  }
});
