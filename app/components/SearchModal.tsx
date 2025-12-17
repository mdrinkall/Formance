/**
 * SearchModal - Search for users/friends
 * Displays search input and filtered user results
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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { supabase } from '../services/supabase';
import { Button } from './ui/Button';
import { getBlockedUsersFilter } from '../services/blockingService';

interface UserResult {
  id: string;
  username: string | null;
  profile_picture_url: string | null;
  full_name?: string | null;
  bio?: string | null;
}

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onUserPress?: (userId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ visible, onClose, onUserPress }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  // Debounced search effect
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    // Clear results if query is empty
    if (!trimmedQuery) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    // Don't search until user types at least 2 characters (reduces DB calls)
    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    // Debounce: wait 500ms after user stops typing before searching
    const timer = setTimeout(() => {
      searchUsers(trimmedQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [visible]);

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

  // Check follow status when search results change
  useEffect(() => {
    if (!currentUserId || searchResults.length === 0) {
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const userIds = searchResults.map(user => user.id);

        const { data, error } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUserId)
          .in('following_id', userIds);

        if (error) throw error;

        const followedIds = new Set(data?.map(f => f.following_id) || []);
        const newFollowStatus: Record<string, boolean> = {};

        searchResults.forEach(user => {
          newFollowStatus[user.id] = followedIds.has(user.id);
        });

        setFollowStatus(newFollowStatus);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [currentUserId, searchResults]);

  const handleFollow = async (userId: string) => {
    if (!currentUserId) return;

    try {
      // Set loading state
      setFollowLoading(prev => ({ ...prev, [userId]: true }));

      // Insert follow relationship
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUserId,
          following_id: userId,
        });

      if (error) throw error;

      // Update local state
      setFollowStatus(prev => ({ ...prev, [userId]: true }));
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!currentUserId) return;

    try {
      // Set loading state
      setFollowLoading(prev => ({ ...prev, [userId]: true }));

      // Delete follow relationship
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', userId);

      if (error) throw error;

      // Update local state
      setFollowStatus(prev => ({ ...prev, [userId]: false }));
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const searchUsers = async (query: string) => {
    try {
      setLoading(true);
      setHasSearched(true);

      // Get blocked users first
      const blockedUsers = currentUserId ? await getBlockedUsersFilter(currentUserId) : [];

      // Build search query
      let searchQuery = supabase
        .from('profiles')
        .select('id, username, profile_picture_url, bio')
        .or(`username.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(20);

      // Apply blocking filter if there are blocked users
      if (blockedUsers.length > 0) {
        searchQuery = searchQuery.not('id', 'in', `(${blockedUsers.join(',')})`);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
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
          <Text style={styles.modalTitle}>Search</Text>
          <View style={styles.modalPlaceholder} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons
              name="search"
              size={20}
              color={palette.text.light.secondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for people... (min 2 characters)"
              placeholderTextColor={palette.text.light.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={50}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
                accessibilityLabel="Clear search"
                accessibilityRole="button"
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={palette.text.light.secondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results */}
        <ScrollView
          style={styles.resultsContainer}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={palette.primary[900]} />
            </View>
          ) : hasSearched && searchResults.length > 0 ? (
            searchResults.map((user) => {
              const isFollowing = followStatus[user.id] || false;
              const isLoading = followLoading[user.id] || false;
              const isCurrentUser = currentUserId === user.id;

              return (
                <View key={user.id} style={styles.userItem}>
                  <TouchableOpacity
                    style={styles.userItemContent}
                    activeOpacity={0.7}
                    accessibilityLabel={`View ${user.username || 'user'} profile`}
                    accessibilityRole="button"
                    onPress={() => onUserPress?.(user.id)}
                  >
                    {/* Profile Picture */}
                    {user.profile_picture_url ? (
                      <Image
                        source={{ uri: user.profile_picture_url }}
                        style={styles.userAvatar}
                      />
                    ) : (
                      <View style={styles.userAvatarPlaceholder}>
                        <Ionicons name="person" size={24} color={palette.primary[900]} />
                      </View>
                    )}

                    {/* User Info */}
                    <View style={styles.userInfo}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {user.username || 'User'}
                      </Text>
                      {user.bio && (
                        <Text style={styles.userBio} numberOfLines={2}>
                          {user.bio}
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
          ) : hasSearched && searchQuery.trim() ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="search-outline"
                size={64}
                color={palette.text.light.secondary}
              />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyDescription}>
                Try searching for a different name or username
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={64}
                color={palette.text.light.secondary}
              />
              <Text style={styles.emptyTitle}>Search for people</Text>
              <Text style={styles.emptyDescription}>
                Find friends and other golfers to follow
              </Text>
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

  // Search Input
  searchContainer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.light,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.neutral[100],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: palette.text.light.primary,
    minHeight: 48,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },

  // Results
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
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
  userBio: {
    ...typography.caption,
    color: palette.text.light.secondary,
    lineHeight: 18,
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
});
