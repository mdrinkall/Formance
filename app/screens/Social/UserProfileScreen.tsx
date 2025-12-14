/**
 * UserProfileScreen
 * View another user's profile with follow/unfollow functionality
 * Read-only display of their stats, recordings, and posts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FollowersModal } from '../../components/FollowersModal';
import { SearchModal } from '../../components/SearchModal';
import { AnalysisCarousel } from '../../components/AnalysisCarousel';
import { useAuthContext } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { getUserRecordings, getRecording } from '../../services/recordingService';

interface Profile {
  id: string;
  username: string | null;
  rating: number | null;
  bio: string | null;
  profile_picture_url: string | null;
  country: string | null;
  swing_goal: string | null;
  is_private: boolean | null;
}

interface CommunityPost {
  id: string;
  type: string | null;
  content: string | null;
  media_url: string | null;
  created_at: string;
}

export default function UserProfileScreen() {
  const { user: currentUser } = useAuthContext();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userId = route.params?.userId;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [hasRequestedFollow, setHasRequestedFollow] = useState(false);
  const [followRequestId, setFollowRequestId] = useState<string | null>(null);

  // Followers/Following modal state
  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [followersModalType, setFollowersModalType] = useState<'followers' | 'following'>('followers');
  const [followersModalUsers, setFollowersModalUsers] = useState<any[]>([]);
  const [followersModalLoading, setFollowersModalLoading] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  // Search modal state
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  useEffect(() => {
    if (userId && currentUser) {
      loadProfileData();
    }
  }, [userId, currentUser]);

  // Reload recordings whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userId && currentUser) {
        loadRecordings();
      }
    }, [userId, currentUser])
  );

  const loadRecordings = async () => {
    try {
      const recordingsData = await getUserRecordings(userId, 8);
      setRecordings(recordingsData);
    } catch (error) {
      console.error('Error loading recordings:', error);
      setRecordings([]);
    }
  };

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Fetch profile info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Update navigation header with user's name
      if (profileData?.username) {
        navigation.setOptions({
          title: profileData.username,
        });
      }

      // Fetch followers count
      const { count: followersCount, error: followersError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (!followersError) setFollowersCount(followersCount || 0);

      // Fetch following count
      const { count: followingCount, error: followingError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (!followingError) setFollowingCount(followingCount || 0);

      // Check if current user follows this user
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUser?.id)
        .eq('following_id', userId)
        .single();

      if (!followError && followData) {
        setIsFollowing(true);
        setHasRequestedFollow(false);
        setFollowRequestId(null);
      } else {
        setIsFollowing(false);

        // Check if there's a pending follow request
        const { data: requestData, error: requestError } = await supabase
          .from('follow_requests')
          .select('*')
          .eq('requester_id', currentUser?.id)
          .eq('requested_id', userId)
          .eq('status', 'pending')
          .maybeSingle(); // Use maybeSingle() instead of single() to avoid 406 error

        if (!requestError && requestData) {
          setHasRequestedFollow(true);
          setFollowRequestId(requestData.id);
        } else {
          setHasRequestedFollow(false);
          setFollowRequestId(null);
        }
      }

      // Fetch user's community posts
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!postsError) setPosts(postsData || []);

      // Load recordings
      await loadRecordings();
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setFollowLoading(true);

      // If account is private, send follow request
      if (isPrivateAccount) {
        const { error } = await supabase
          .from('follow_requests')
          .insert({
            requester_id: currentUser.id,
            requested_id: userId,
            status: 'pending',
          });

        if (error) throw error;

        setHasRequestedFollow(true);

        // Create notification for the user
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'follow_request',
            data: { requester_id: currentUser.id },
          });
      } else {
        // Public account - follow directly
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: userId,
          });

        if (error) throw error;

        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);

        // Create notification for the user
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'new_follower',
            data: { follower_id: currentUser.id },
          });
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser) return;

    try {
      setFollowLoading(true);

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId);

      if (error) throw error;

      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!currentUser || !followRequestId) return;

    try {
      setFollowLoading(true);

      const { error } = await supabase
        .from('follow_requests')
        .delete()
        .eq('id', followRequestId);

      if (error) throw error;

      setHasRequestedFollow(false);
      setFollowRequestId(null);
    } catch (error) {
      console.error('Error canceling follow request:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const loadFollowers = async () => {
    try {
      setFollowersModalLoading(true);
      setFollowersModalType('followers');
      setFollowersModalVisible(true);

      // Fetch followers (users who follow this user)
      const { data, error } = await supabase
        .from('follows')
        .select('follower_id, profiles:follower_id(id, username, profile_picture_url)')
        .eq('following_id', userId);

      if (error) throw error;

      const users = data?.map((item: any) => item.profiles).filter(Boolean) || [];
      setFollowersModalUsers(users);
    } catch (error) {
      console.error('Error loading followers:', error);
      setFollowersModalUsers([]);
    } finally {
      setFollowersModalLoading(false);
    }
  };

  const loadFollowing = async () => {
    try {
      setFollowersModalLoading(true);
      setFollowersModalType('following');
      setFollowersModalVisible(true);

      // Fetch following (users this user follows)
      const { data, error } = await supabase
        .from('follows')
        .select('following_id, profiles:following_id(id, username, profile_picture_url)')
        .eq('follower_id', userId);

      if (error) throw error;

      const users = data?.map((item: any) => item.profiles).filter(Boolean) || [];
      setFollowersModalUsers(users);
    } catch (error) {
      console.error('Error loading following:', error);
      setFollowersModalUsers([]);
    } finally {
      setFollowersModalLoading(false);
    }
  };

  const handleSearchPress = () => {
    setFollowersModalVisible(false);
    setSearchModalVisible(true);
  };

  const handleUserPress = (newUserId: string) => {
    setFollowersModalVisible(false);
    setSearchModalVisible(false);

    // Navigate to this user's profile (can be nested)
    navigation.push('UserProfile', { userId: newUserId });
  };

  const handleRecordingPress = async (recordingId: string) => {
    try {
      const recording = await getRecording(recordingId);

      if (!recording) {
        console.error('Recording not found');
        return;
      }

      navigation.navigate('Analysis', {
        screen: 'Results',
        params: {
          videoUrl: recording.video_url,
          selectedClub: recording.club_used || 'Unknown',
          shotShape: recording.shot_shape || 'Unknown',
          recordingId: recording.id,
        },
      });
    } catch (error) {
      console.error('Error loading recording:', error);
    }
  };

  // Check if user can view private content
  const isPrivateAccount = profile?.is_private === true;
  const canViewPrivateContent = !isPrivateAccount || isFollowing;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary[900]} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="person-outline" size={64} color={palette.text.light.secondary} />
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture, Followers, Following, Rating Row */}
        <View style={styles.statsRow}>
          <View style={styles.avatarContainer}>
            {profile.profile_picture_url ? (
              <Image source={{ uri: profile.profile_picture_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color={palette.primary[900]} />
              </View>
            )}
          </View>

          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={loadFollowers}
              activeOpacity={0.7}
              accessibilityLabel="View followers"
              accessibilityRole="button"
            >
              <Text style={styles.statValue}>{followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statItem}
              onPress={loadFollowing}
              activeOpacity={0.7}
              accessibilityLabel="View following"
              accessibilityRole="button"
            >
              <Text style={styles.statValue}>{followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.rating || 'N/A'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* User Info */}
        {profile.username && (
          <Text style={styles.username}>@{profile.username}</Text>
        )}
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        {profile.country && (
          <Text style={styles.location}>{profile.country}</Text>
        )}

        {/* Action Buttons */}
        {isFollowing ? (
          <View style={styles.buttonRow}>
            <Button
              title="Following"
              variant="outline"
              style={styles.halfButton}
              onPress={handleUnfollow}
              loading={followLoading}
            />
            <Button
              title="Message"
              variant="primary"
              style={styles.halfButton}
              disabled
            />
          </View>
        ) : hasRequestedFollow ? (
          <Button
            title="Requested"
            variant="outline"
            style={styles.fullWidthButton}
            onPress={handleCancelRequest}
            loading={followLoading}
          />
        ) : (
          <Button
            title={isPrivateAccount ? 'Request to Follow' : 'Follow'}
            variant="primary"
            style={styles.fullWidthButton}
            onPress={handleFollow}
            loading={followLoading}
          />
        )}

        {/* Private Account Message or Content */}
        {!canViewPrivateContent ? (
          <Card style={styles.privateCard}>
            <Ionicons name="lock-closed" size={64} color={palette.text.light.secondary} />
            <Text style={styles.privateTitle}>This Account is Private</Text>
            <Text style={styles.privateDescription}>
              Follow this account to see their recordings and posts
            </Text>
          </Card>
        ) : (
          <>
            {/* Analysis Carousel - Only show if there are recordings */}
            {recordings.length > 0 && (
              <AnalysisCarousel
                recordings={recordings}
                onRecordingPress={handleRecordingPress}
                onNewPress={undefined}
              />
            )}

            {/* Section Divider */}
            <View style={styles.sectionDivider} />

            {/* Posts Section */}
            {posts.length > 0 ? (
              posts.map((post) => (
                <Card key={post.id} style={styles.postCard}>
                  {post.media_url && (
                    <Image source={{ uri: post.media_url }} style={styles.postImage} />
                  )}
                  {post.content && <Text style={styles.postContent}>{post.content}</Text>}
                  <Text style={styles.postDate}>
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </Card>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Ionicons name="chatbubbles-outline" size={48} color={palette.text.light.secondary} />
                <Text style={styles.emptyTitle}>No posts yet</Text>
                <Text style={styles.emptyDescription}>
                  This user hasn't shared anything with the community
                </Text>
              </Card>
            )}
          </>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Followers/Following Modal */}
      <FollowersModal
        visible={followersModalVisible}
        onClose={() => {
          setFollowersModalVisible(false);
          if (needsRefresh) {
            loadProfileData();
            setNeedsRefresh(false);
          }
        }}
        title={followersModalType === 'followers' ? 'Followers' : 'Following'}
        users={followersModalUsers}
        loading={followersModalLoading}
        onSearchPress={handleSearchPress}
        onFollowChange={() => setNeedsRefresh(true)}
        onUserPress={handleUserPress}
      />

      {/* Search Modal */}
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onUserPress={handleUserPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.accent.white,
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
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.massive,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.accent.white,
  },
  errorText: {
    ...typography.h4,
    color: palette.text.light.secondary,
    marginTop: spacing.lg,
  },
  footerSpacer: {
    height: spacing.xl,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.base,
    marginBottom: spacing.lg,
    gap: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: palette.neutral[200],
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: palette.primary[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  statValue: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: palette.text.light.secondary,
  },

  // User Info
  username: {
    ...typography.label,
    color: palette.text.light.secondary,
    marginBottom: spacing.sm,
  },
  bio: {
    ...typography.body,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  location: {
    ...typography.body,
    color: palette.text.light.secondary,
    marginBottom: spacing.lg,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  halfButton: {
    flex: 1,
  },
  fullWidthButton: {
    marginBottom: spacing.lg,
  },

  // Section Divider
  sectionDivider: {
    height: 1,
    backgroundColor: palette.border.light,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    marginHorizontal: -spacing.base,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
      },
    }),
  },

  // Posts
  postCard: {
    marginBottom: spacing.base,
  },
  postImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    marginBottom: spacing.base,
    backgroundColor: palette.neutral[200],
  },
  postContent: {
    ...typography.body,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  postDate: {
    ...typography.caption,
    color: palette.text.light.secondary,
  },

  // Empty State
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.base,
  },
  emptyTitle: {
    ...typography.h4,
    marginTop: spacing.base,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    ...typography.body,
    color: palette.text.light.secondary,
    textAlign: 'center',
  },

  // Private Account
  privateCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    marginBottom: spacing.base,
  },
  privateTitle: {
    ...typography.h4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  privateDescription: {
    ...typography.body,
    color: palette.text.light.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});
