/**
 * FollowersModal - Displays followers or following list
 * Shows user profile pictures and names in a scrollable list
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { Button } from './ui/Button';
import { supabase } from '../services/supabase';

interface UserItem {
  id: string;
  username: string | null;
  profile_picture_url: string | null;
  full_name?: string | null;
}

interface FollowersModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  users: UserItem[];
  loading: boolean;
  onSearchPress?: () => void;
  onFollowChange?: () => void;
  onUserPress?: (userId: string) => void;
}

export const FollowersModal: React.FC<FollowersModalProps> = ({
  visible,
  onClose,
  title,
  users,
  loading,
  onSearchPress,
  onFollowChange,
  onUserPress,
}) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Check follow status when users change
  useEffect(() => {
    if (!currentUserId || users.length === 0) {
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const userIds = users.map(user => user.id);

        const { data, error } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUserId)
          .in('following_id', userIds);

        if (error) throw error;

        const followedIds = new Set(data?.map(f => f.following_id) || []);
        const newFollowStatus: Record<string, boolean> = {};

        users.forEach(user => {
          newFollowStatus[user.id] = followedIds.has(user.id);
        });

        setFollowStatus(newFollowStatus);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [currentUserId, users]);

  const handleFollow = async (userId: string) => {
    if (!currentUserId) return;

    try {
      setFollowLoading(prev => ({ ...prev, [userId]: true }));

      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUserId,
          following_id: userId,
        });

      if (error) throw error;

      setFollowStatus(prev => ({ ...prev, [userId]: true }));

      // Notify parent to refresh
      if (onFollowChange) {
        onFollowChange();
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!currentUserId) return;

    try {
      setFollowLoading(prev => ({ ...prev, [userId]: true }));

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', userId);

      if (error) throw error;

      setFollowStatus(prev => ({ ...prev, [userId]: false }));

      // Notify parent to refresh
      if (onFollowChange) {
        onFollowChange();
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.modalCloseButton}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={28} color={palette.text.light.primary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.modalPlaceholder} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={palette.primary[900]} />
            </View>
          ) : users.length > 0 ? (
            users.map((user) => {
              const isFollowing = followStatus[user.id] || false;
              const isLoading = followLoading[user.id] || false;
              const isCurrentUser = currentUserId === user.id;

              return (
                <View key={user.id} style={styles.userItem}>
                  <TouchableOpacity
                    style={styles.userItemContent}
                    onPress={() => onUserPress?.(user.id)}
                    activeOpacity={0.7}
                    accessibilityLabel={`View ${user.username || 'user'} profile`}
                    accessibilityRole="button"
                  >
                    {/* Profile Picture */}
                    {user.profile_picture_url ? (
                      <Image
                        source={{ uri: user.profile_picture_url }}
                        style={styles.userAvatar}
                      />
                    ) : (
                      <View style={styles.userAvatarPlaceholder}>
                        <Ionicons
                          name="person"
                          size={24}
                          color={palette.primary[900]}
                        />
                      </View>
                    )}

                    {/* User Info */}
                    <View style={styles.userInfo}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {user.full_name || user.username || 'User'}
                      </Text>
                      {user.username && (
                        <Text style={styles.userHandle} numberOfLines={1}>
                          @{user.username}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Follow/Unfollow Button - Don't show for current user */}
                  {!isCurrentUser && (
                    <Button
                      title={isFollowing ? 'Following' : 'Follow'}
                      variant={isFollowing ? 'outline' : 'primary'}
                      size="sm"
                      loading={isLoading}
                      onPress={() => isFollowing ? handleUnfollow(user.id) : handleFollow(user.id)}
                      style={styles.followButton}
                    />
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={64}
                color={palette.text.light.secondary}
              />
              <Text style={styles.emptyTitle}>
                {title === 'Followers' ? 'No followers yet' : 'Not following anyone yet'}
              </Text>
              <Text style={styles.emptyDescription}>
                {title === 'Followers'
                  ? 'When people follow you, they will appear here'
                  : 'Start following others to see them here'}
              </Text>

              {/* Search button for Following tab */}
              {title === 'Following' && onSearchPress && (
                <Button
                  title="Search for people"
                  variant="primary"
                  size="md"
                  onPress={onSearchPress}
                  style={styles.searchButton}
                />
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },

  // User Item
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: palette.accent.white,
    borderRadius: 12,
    marginBottom: spacing.sm,
    minHeight: 64,
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      },
    }),
  },
  userItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 48,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.neutral[200],
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.primary[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  userHandle: {
    ...typography.caption,
    color: palette.text.light.secondary,
  },
  followButton: {
    minWidth: 100,
    alignSelf: 'center',
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
  searchButton: {
    marginTop: spacing.xl,
    minWidth: 200,
  },
});
