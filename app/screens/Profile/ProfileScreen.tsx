/**
 * ProfileScreen
 * User profile with edit capabilities, stats, followers/following, and posts
 */

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FollowersModal } from '../../components/FollowersModal';
import { SearchModal } from '../../components/SearchModal';
import { useAuthContext } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { uploadAvatar, deleteFile } from '../../services/storageService';

interface Profile {
  id: string;
  username: string | null;
  handicap: number | null;
  bio: string | null;
  profile_picture_url: string | null;
  country: string | null;
  swing_goal: string | null;
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
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
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

  // Edit form state
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editHandicap, setEditHandicap] = useState('');
  const [editSwingGoal, setEditSwingGoal] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Set edit form initial values
      setEditUsername(profileData?.username || '');
      setEditBio(profileData?.bio || '');
      setEditCountry(profileData?.country || '');
      setEditHandicap(profileData?.handicap?.toString() || '');
      setEditSwingGoal(profileData?.swing_goal || '');

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

      // Fetch user's community posts
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!postsError) setPosts(postsData || []);
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
        handicap: editHandicap ? parseFloat(editHandicap) : null,
        swing_goal: editSwingGoal || null,
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
              <Text style={styles.statValue}>{profile?.handicap || 'N/A'}</Text>
              <Text style={styles.statLabel}>Handicap</Text>
            </View>
          </View>
        </View>

        {/* User Info */}
        {profile?.username && (
          <Text style={styles.username}>@{profile.username}</Text>
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
              label="Handicap"
              value={editHandicap}
              onChangeText={setEditHandicap}
              placeholder="e.g., 15.2"
              keyboardType="decimal-pad"
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
      />

      {/* Search Modal */}
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.accent.white,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
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
});
