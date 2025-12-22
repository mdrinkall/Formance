/**
 * ProfileScreen
 * User profile with edit capabilities, stats, followers/following, and posts
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
  Modal,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FollowersModal } from '../../components/FollowersModal';
import { SearchModal } from '../../components/SearchModal';
import { AnalysisCarousel } from '../../components/AnalysisCarousel';
import { SubscriptionStatus } from '../../components/SubscriptionStatus';
import { useAuthContext } from '../../context/AuthContext';
import { useSubscriptionContext } from '../../context/SubscriptionContext';
import { supabase } from '../../services/supabase';
import { uploadAvatar, deleteFile } from '../../services/storageService';
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

export default function ProfileScreen() {
  const { user } = useAuthContext();
  const { isActive: hasActiveSubscription } = useSubscriptionContext();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Followers/Following modal state
  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [followersModalType, setFollowersModalType] = useState<'followers' | 'following'>('followers');
  const [followersModalUsers, setFollowersModalUsers] = useState<any[]>([]);
  const [followersModalLoading, setFollowersModalLoading] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  // Search modal state
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  // Follow requests state
  const [followRequestsCount, setFollowRequestsCount] = useState(0);
  const [followRequestsModalVisible, setFollowRequestsModalVisible] = useState(false);
  const [followRequests, setFollowRequests] = useState<any[]>([]);
  const [followRequestsLoading, setFollowRequestsLoading] = useState(false);

  // Edit form state
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editSwingGoal, setEditSwingGoal] = useState('');
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  // Reload recordings and profile info whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadRecordings();
        loadProfileInfo();
      }
    }, [user])
  );

  const loadRecordings = async () => {
    try {
      const recordingsData = await getUserRecordings(user!.id, 8);
      setRecordings(recordingsData);
    } catch (error) {
      console.error('Error loading recordings:', error);
      setRecordings([]);
    }
  };

  const loadProfileInfo = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Update edit form values
      setEditUsername(profileData?.username || '');
      setEditBio(profileData?.bio || '');
      setEditCountry(profileData?.country || '');
      setEditSwingGoal(profileData?.swing_goal || '');
      setEditIsPrivate(profileData?.is_private || false);
    } catch (error) {
      console.error('Error loading profile info:', error);
    }
  };

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Fetch profile info
      await loadProfileInfo();

      // Fetch followers count
      const { count: followersCount, error: followersError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user?.id);

      if (!followersError) setFollowersCount(followersCount || 0);

      // Fetch following count
      const { count: followingCount, error: followingError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user?.id);

      if (!followingError) setFollowingCount(followingCount || 0);

      // Fetch pending follow requests count (only if account is private)
      const { count: requestsCount, error: requestsError } = await supabase
        .from('follow_requests')
        .select('*', { count: 'exact', head: true })
        .eq('requested_id', user?.id)
        .eq('status', 'pending');

      if (!requestsError) setFollowRequestsCount(requestsCount || 0);

      // Fetch user's community posts
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!postsError) setPosts(postsData || []);

      // Load recordings separately (handled by useFocusEffect)
      await loadRecordings();
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to change your profile picture.');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image');
    }
  };

  const uploadProfilePicture = async (uri: string) => {
    try {
      setUploadingImage(true);

      // Delete old profile picture if it exists
      if (profile?.profile_picture_url) {
        try {
          // Extract the file path from the URL
          // URL format: https://[project].supabase.co/storage/v1/object/public/profiles/[path]
          const urlParts = profile.profile_picture_url.split('/profiles/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await deleteFile('profiles', filePath);
          }
        } catch (deleteError) {
          console.warn('Error deleting old profile picture:', deleteError);
          // Continue with upload even if delete fails
        }
      }

      // For web, fetch the image as blob
      let fileToUpload: string | Blob = uri;
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        fileToUpload = await response.blob();
      }

      // Upload to Supabase storage
      const publicUrl = await uploadAvatar(fileToUpload, user!.id);

      // Update profile with new URL
      const { error } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', user!.id);

      if (error) throw error;

      // Reload profile
      await loadProfileData();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const updates = {
        username: editUsername || null,
        bio: editBio || null,
        country: editCountry || null,
        swing_goal: editSwingGoal || null,
        is_private: editIsPrivate,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user!.id);

      if (error) throw error;

      await loadProfileData();
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const loadFollowRequests = async () => {
    try {
      setFollowRequestsLoading(true);
      setFollowRequestsModalVisible(true);

      // Fetch pending follow requests with user details
      const { data, error } = await supabase
        .from('follow_requests')
        .select('id, requester_id, created_at, profiles:requester_id(id, username, profile_picture_url)')
        .eq('requested_id', user?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFollowRequests(data || []);
    } catch (error) {
      console.error('Error loading follow requests:', error);
      setFollowRequests([]);
    } finally {
      setFollowRequestsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.rpc('accept_follow_request', {
        request_id: requestId,
      });

      if (error) throw error;

      // Reload requests and update counts
      await loadFollowRequests();
      await loadProfileData();
    } catch (error) {
      console.error('Error approving follow request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.rpc('reject_follow_request', {
        request_id: requestId,
      });

      if (error) throw error;

      // Reload requests
      await loadFollowRequests();
      setFollowRequestsCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error rejecting follow request:', error);
    }
  };

  const loadFollowers = async () => {
    try {
      setFollowersModalLoading(true);
      setFollowersModalType('followers');
      setFollowersModalVisible(true);

      // Fetch followers (users who follow me)
      // Join follows table with profiles to get user details
      const { data, error } = await supabase
        .from('follows')
        .select('follower_id, profiles:follower_id(id, username, profile_picture_url)')
        .eq('following_id', user?.id);

      if (error) throw error;

      // Transform the data to a flat structure
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

      // Fetch following (users I follow)
      // Join follows table with profiles to get user details
      const { data, error } = await supabase
        .from('follows')
        .select('following_id, profiles:following_id(id, username, profile_picture_url)')
        .eq('follower_id', user?.id);

      if (error) throw error;

      // Transform the data to a flat structure
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

  const handleUserPress = (userId: string) => {
    setFollowersModalVisible(false);
    setSearchModalVisible(false);
    navigation.navigate('Social', {
      screen: 'UserProfile',
      params: { userId },
    });
  };

  const handleRecordingPress = async (recordingId: string) => {
    try {
      // Fetch the full recording data
      const recording = await getRecording(recordingId);

      if (!recording) {
        console.error('Recording not found');
        return;
      }

      // Navigate to the Analysis stack's Results screen with the recording data
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

  const handleNewAnalysis = () => {
    // Navigate to the Analysis stack's VideoUpload screen
    navigation.navigate('Analysis', {
      screen: 'VideoUpload',
    });
  };

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.fullName || profile?.username || 'User';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary[900]} />
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
        {/* Profile Picture, Followers, Following, Handicap Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={pickImage}
            activeOpacity={0.8}
            accessibilityLabel="Change profile picture"
            accessibilityRole="button"
          >
            {profile?.profile_picture_url ? (
              <Image source={{ uri: profile.profile_picture_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color={palette.primary[900]} />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color={palette.accent.white} />
            </View>
            {uploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color={palette.accent.white} />
              </View>
            )}
          </TouchableOpacity>

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
              <Text style={styles.statValue}>{profile?.rating || 'N/A'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* User Info */}
        {profile?.username && (
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>@{profile.username}</Text>
            {hasActiveSubscription && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </View>
        )}
        {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        {profile?.country && (
          <Text style={styles.location}>{profile.country}</Text>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <Button
            title="Edit Profile"
            variant="primary"
            style={styles.halfButton}
            onPress={() => setEditModalVisible(true)}
          />
          <Button
            title="Share Profile"
            variant="outline"
            style={styles.halfButton}
            onPress={() => console.log('Share profile')}
          />
        </View>

        {/* Follow Requests Button (only show if there are pending requests) */}
        {followRequestsCount > 0 && (
          <TouchableOpacity
            style={styles.followRequestsButton}
            onPress={loadFollowRequests}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${followRequestsCount} follow request${followRequestsCount > 1 ? 's' : ''}`}
          >
            <Ionicons name="person-add" size={20} color={palette.primary[900]} />
            <Text style={styles.followRequestsText}>
              {followRequestsCount} Follow Request{followRequestsCount > 1 ? 's' : ''}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={palette.text.light.secondary} />
          </TouchableOpacity>
        )}

        {/* Subscription Status - Only show if no active subscription */}
        {!hasActiveSubscription && (
          <SubscriptionStatus
            style={styles.subscriptionStatus}
            onUpgrade={() => navigation.navigate('Home')}
          />
        )}

        {/* Analysis Carousel */}
        <AnalysisCarousel
          recordings={recordings}
          onRecordingPress={handleRecordingPress}
          onNewPress={handleNewAnalysis}
        />

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
              Share your golf journey with the community
            </Text>
          </Card>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              style={styles.modalCloseButton}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={28} color={palette.text.light.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Input
              label="Username"
              value={editUsername}
              onChangeText={setEditUsername}
              placeholder="@username"
              autoCapitalize="none"
            />
            <Input
              label="Bio"
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />
            <Input
              label="Country"
              value={editCountry}
              onChangeText={setEditCountry}
              placeholder="e.g., United States"
            />
            <Input
              label="Swing Goal"
              value={editSwingGoal}
              onChangeText={setEditSwingGoal}
              placeholder="e.g., Improve tempo"
              multiline
              numberOfLines={2}
              style={styles.textArea}
            />

            {/* Privacy Toggle */}
            <View style={styles.privacyContainer}>
              <View style={styles.privacyTextContainer}>
                <Text style={styles.privacyLabel}>Private Account</Text>
                <Text style={styles.privacyDescription}>
                  Only your followers can see your profile, recordings, and posts
                </Text>
              </View>
              <Switch
                value={editIsPrivate}
                onValueChange={setEditIsPrivate}
                trackColor={{
                  false: palette.neutral[300],
                  true: palette.primary[900],
                }}
                thumbColor={palette.accent.white}
                ios_backgroundColor={palette.neutral[300]}
              />
            </View>

            <Button
              title="Save Changes"
              variant="primary"
              onPress={handleSaveProfile}
              loading={saving}
              style={styles.saveButton}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Followers/Following Modal */}
      <FollowersModal
        visible={followersModalVisible}
        onClose={() => {
          setFollowersModalVisible(false);
          // Refresh profile data after modal closes if changes were made
          if (needsRefresh) {
            loadProfileData();
            setNeedsRefresh(false);
          }
        }}
        title={followersModalType === 'followers' ? 'Followers' : 'Following'}
        users={followersModalUsers}
        loading={followersModalLoading}
        onSearchPress={handleSearchPress}
        onFollowChange={() => {
          // Mark that we need to refresh when modal closes
          setNeedsRefresh(true);
        }}
        onUserPress={handleUserPress}
      />

      {/* Search Modal */}
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onUserPress={handleUserPress}
      />

      {/* Follow Requests Modal */}
      <Modal
        visible={followRequestsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFollowRequestsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setFollowRequestsModalVisible(false)}
              style={styles.modalCloseButton}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={28} color={palette.text.light.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Follow Requests</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {followRequestsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={palette.primary[900]} />
              </View>
            ) : followRequests.length > 0 ? (
              followRequests.map((request) => (
                <View key={request.id} style={styles.requestItem}>
                  <View style={styles.requestUserInfo}>
                    {request.profiles?.profile_picture_url ? (
                      <Image
                        source={{ uri: request.profiles.profile_picture_url }}
                        style={styles.requestAvatar}
                      />
                    ) : (
                      <View style={styles.requestAvatarPlaceholder}>
                        <Ionicons name="person" size={24} color={palette.primary[900]} />
                      </View>
                    )}
                    <View style={styles.requestTextContainer}>
                      <Text style={styles.requestUsername}>
                        {request.profiles?.username || 'User'}
                      </Text>
                      <Text style={styles.requestTime}>
                        {new Date(request.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.requestActions}>
                    <Button
                      title="Accept"
                      variant="primary"
                      size="sm"
                      onPress={() => handleApproveRequest(request.id)}
                      style={styles.requestButton}
                    />
                    <Button
                      title="Decline"
                      variant="outline"
                      size="sm"
                      onPress={() => handleRejectRequest(request.id)}
                      style={styles.requestButton}
                    />
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="person-add-outline" size={64} color={palette.text.light.secondary} />
                <Text style={styles.emptyTitle}>No Follow Requests</Text>
                <Text style={styles.emptyDescription}>
                  When people request to follow you, they'll appear here
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
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
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.primary[900],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: palette.accent.white,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  username: {
    ...typography.label,
    color: palette.text.light.secondary,
  },
  proBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: palette.primary[900],
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

  // Section Divider
  sectionDivider: {
    height: 1,
    backgroundColor: palette.border.light,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    marginHorizontal: -spacing.base, // Extend to screen edges
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

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: palette.accent.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: Platform.OS === 'ios' ? spacing.huge : spacing.lg,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.light,
  },
  modalCloseButton: {
    padding: spacing.xs,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  modalTitle: {
    ...typography.h4,
  },
  modalPlaceholder: {
    width: 44,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: spacing.base,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: spacing.base,
    marginBottom: spacing.xl,
  },

  // Privacy Toggle
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.neutral[100],
    borderRadius: 12,
    marginVertical: spacing.base,
    minHeight: 64,
  },
  privacyTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  privacyLabel: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  privacyDescription: {
    ...typography.caption,
    color: palette.text.light.secondary,
    lineHeight: 18,
  },

  // Follow Requests
  followRequestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: palette.primary[50],
    borderRadius: 12,
    marginBottom: spacing.lg,
    minHeight: 56,
    borderWidth: 1,
    borderColor: palette.primary[200],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  subscriptionStatus: {
    marginBottom: spacing.lg,
  },
  followRequestsText: {
    ...typography.body,
    fontWeight: '600',
    color: palette.primary[900],
    flex: 1,
    marginLeft: spacing.sm,
  },

  // Request Item
  requestItem: {
    backgroundColor: palette.accent.white,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      },
    }),
  },
  requestUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.neutral[200],
  },
  requestAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.primary[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  requestUsername: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  requestTime: {
    ...typography.caption,
    color: palette.text.light.secondary,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  requestButton: {
    flex: 1,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.body,
    color: palette.text.light.secondary,
    textAlign: 'center',
  },
});
