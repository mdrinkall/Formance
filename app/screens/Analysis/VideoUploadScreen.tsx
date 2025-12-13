/**
 * VideoUploadScreen
 * Select and upload swing video
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Button } from '../../components/ui/Button';
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

  useEffect(() => {
    fetchRecentVideos();
  }, []);

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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
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

            <Button
              title={loading ? 'Uploading...' : 'Upload Video'}
              variant="secondary"
              size="lg"
              fullWidth
              onPress={handlePickVideo}
              loading={loading}
              disabled={loading}
            />

            {/* Divider with OR */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Recently Uploaded */}
            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>Recently Uploaded</Text>

              {loadingRecent ? (
                <Text style={styles.loadingText}>Loading recent videos...</Text>
              ) : recentVideos.length > 0 ? (
                <>
                  <View style={styles.videoGrid}>
                    {(showAllVideos ? recentVideos : recentVideos.slice(0, 4)).map((video, index) => (
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
                        <View style={styles.dateOverlay}>
                          <Text style={styles.overlayDate}>
                            {new Date(video.created_at).toLocaleString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              month: 'short',
                              day: 'numeric',
                              hour12: false
                            })}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Show More Button */}
                  {recentVideos.length > 4 && (
                    <TouchableOpacity
                      style={styles.showMoreButton}
                      onPress={() => setShowAllVideos(!showAllVideos)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.showMoreText}>
                        {showAllVideos ? 'Show Less' : `Show More (${recentVideos.length - 4} more)`}
                      </Text>
                      <Ionicons
                        name={showAllVideos ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={palette.accent.white}
                      />
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <Text style={styles.emptyText}>No recent videos found</Text>
              )}
            </View>
          </View>
        </ScrollView>
    </View>
  );
}

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
  title: {
    ...typography.h3,
    fontWeight: '400',
    color: palette.accent.white,
    marginBottom: spacing.xl,
    textAlign: 'left',
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xxxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    ...typography.label,
    color: palette.accent.white,
    opacity: 0.6,
    marginHorizontal: spacing.base,
  },
  recentSection: {
    marginTop: spacing.base,
  },
  recentTitle: {
    ...typography.h4,
    fontWeight: '400',
    color: palette.accent.white,
    marginBottom: spacing.lg,
    textAlign: 'left',
  },
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  thumbnailCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  overlayDate: {
    ...typography.caption,
    color: palette.accent.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingText: {
    ...typography.body,
    color: palette.accent.white,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  emptyText: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  showMoreText: {
    ...typography.label,
    color: palette.accent.white,
    marginRight: spacing.sm,
  },
});
