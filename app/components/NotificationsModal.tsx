/**
 * NotificationsModal
 * Displays user notifications with mark as read functionality
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { useNotifications } from '../context/NotificationsContext';
import { supabase } from '../services/supabase';
import { useNavigation } from '@react-navigation/native';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const navigation = useNavigation<any>();
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});

  // Fetch user profiles for notifications
  useEffect(() => {
    const fetchUserProfiles = async () => {
      const userIds = new Set<string>();

      notifications.forEach(notif => {
        const userId = notif.data?.follower_id || notif.data?.requester_id;
        if (userId) userIds.add(userId);
      });

      if (userIds.size === 0) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, profile_picture_url')
          .in('id', Array.from(userIds));

        if (error) throw error;

        const profilesMap: Record<string, any> = {};
        data?.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
        setUserProfiles(profilesMap);
      } catch (error) {
        console.error('Error fetching user profiles:', error);
      }
    };

    if (notifications.length > 0) {
      fetchUserProfiles();
    }
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_follower':
        return 'person-add';
      case 'follow_request':
        return 'person-add-outline';
      case 'follow_request_accepted':
        return 'checkmark-circle';
      case 'new_message':
        return 'mail';
      case 'sale':
        return 'cash';
      case 'like':
        return 'heart';
      case 'comment':
        return 'chatbubble';
      default:
        return 'notifications';
    }
  };

  const getNotificationText = (notification: any) => {
    const userId = notification.data?.follower_id || notification.data?.requester_id;
    const userProfile = userId ? userProfiles[userId] : null;
    const username = userProfile?.username || 'Someone';

    switch (notification.type) {
      case 'new_follower':
        return `${username} started following you`;
      case 'follow_request':
        return `${username} requested to follow you`;
      case 'follow_request_accepted':
        return `${username} accepted your follow request`;
      case 'new_message':
        return `${username} sent you a message: "${notification.data?.preview || 'New message'}"`;
      case 'sale':
        return `You made a sale of $${notification.data?.amount || '0'}`;
      case 'like':
        return `${username} liked your post`;
      case 'comment':
        return `${username} commented on your post`;
      default:
        return 'New notification';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNotificationPress = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    const userId = notification.data?.follower_id || notification.data?.requester_id;

    // Handle different notification types
    switch (notification.type) {
      case 'new_follower':
      case 'follow_request_accepted':
        // Navigate to the user's profile
        if (userId) {
          onClose();
          navigation.navigate('Social', {
            screen: 'UserProfile',
            params: { userId },
          });
        }
        break;

      case 'follow_request':
        // For follow requests, don't auto-navigate - let them accept/reject in the notification
        break;

      default:
        console.log('Navigate to:', notification.type, notification.data);
        break;
    }
  };

  const handleAcceptFollowRequest = async (notification: any) => {
    try {
      let requestId = notification.data?.request_id;

      // If request_id is missing, look it up using requester_id
      if (!requestId) {
        const requesterId = notification.data?.requester_id;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !requesterId) return;

        const { data: requests, error: lookupError } = await supabase
          .from('follow_requests')
          .select('id')
          .eq('requester_id', requesterId)
          .eq('requested_id', user.id)
          .eq('status', 'pending')
          .limit(1);

        if (lookupError) throw lookupError;

        if (requests && requests.length > 0) {
          requestId = requests[0].id;
        } else {
          return;
        }
      }

      const { error } = await supabase.rpc('accept_follow_request', {
        request_id: requestId,
      });

      if (error) throw error;

      // Delete ALL follow_request notifications from this requester (in case of duplicates)
      const requesterId = notification.data?.requester_id;
      const { data: { user } } = await supabase.auth.getUser();

      if (requesterId && user) {
        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .eq('user_id', user.id)
          .eq('type', 'follow_request')
          .contains('data', { requester_id: requesterId });

        if (deleteError) {
          console.error('Error deleting notifications:', deleteError);
        }
      }

      // Refresh notifications to update the list
      await refreshNotifications();
    } catch (error) {
      console.error('Error accepting follow request:', error);
    }
  };

  const handleRejectFollowRequest = async (notification: any) => {
    try {
      let requestId = notification.data?.request_id;

      // If request_id is missing, look it up using requester_id
      if (!requestId) {
        const requesterId = notification.data?.requester_id;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !requesterId) return;

        const { data: requests, error: lookupError } = await supabase
          .from('follow_requests')
          .select('id')
          .eq('requester_id', requesterId)
          .eq('requested_id', user.id)
          .eq('status', 'pending')
          .limit(1);

        if (lookupError) throw lookupError;

        if (requests && requests.length > 0) {
          requestId = requests[0].id;
        } else {
          return;
        }
      }

      const { error } = await supabase.rpc('reject_follow_request', {
        request_id: requestId,
      });

      if (error) throw error;

      // Delete ALL follow_request notifications from this requester (in case of duplicates)
      const requesterId = notification.data?.requester_id;
      const { data: { user } } = await supabase.auth.getUser();

      if (requesterId && user) {
        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .eq('user_id', user.id)
          .eq('type', 'follow_request')
          .contains('data', { requester_id: requesterId });

        if (deleteError) {
          console.error('Error deleting notifications:', deleteError);
        }
      }

      // Refresh notifications to update the list
      await refreshNotifications();
    } catch (error) {
      console.error('Error rejecting follow request:', error);
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
          <Text style={styles.modalTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              style={styles.markAllButton}
              accessibilityLabel="Mark all as read"
              accessibilityRole="button"
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
          {unreadCount === 0 && <View style={styles.modalPlaceholder} />}
        </View>

        {/* Notifications List */}
        <ScrollView
          style={styles.notificationsList}
          contentContainerStyle={styles.notificationsContent}
          showsVerticalScrollIndicator={false}
        >
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const userId = notification.data?.follower_id || notification.data?.requester_id;
              const userProfile = userId ? userProfiles[userId] : null;
              const isFollowRequest = notification.type === 'follow_request';

              return (
                <View
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    !notification.is_read && styles.notificationItemUnread,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.notificationTouchable}
                    onPress={() => handleNotificationPress(notification)}
                    activeOpacity={0.7}
                    disabled={isFollowRequest}
                  >
                    {/* Profile Picture or Icon */}
                    {userProfile?.profile_picture_url ? (
                      <Image
                        source={{ uri: userProfile.profile_picture_url }}
                        style={styles.profilePicture}
                      />
                    ) : (
                      <View
                        style={[
                          styles.iconContainer,
                          !notification.is_read && styles.iconContainerUnread,
                        ]}
                      >
                        <Ionicons
                          name={getNotificationIcon(notification.type) as any}
                          size={24}
                          color={notification.is_read ? palette.text.light.secondary : palette.primary[900]}
                        />
                      </View>
                    )}

                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationText}>
                        {getNotificationText(notification)}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {formatTime(notification.created_at)}
                      </Text>
                    </View>

                    {!notification.is_read && !isFollowRequest && <View style={styles.unreadDot} />}
                  </TouchableOpacity>

                  {/* Follow Request Actions */}
                  {isFollowRequest && (
                    <View style={styles.followRequestActions}>
                      <TouchableOpacity
                        style={[styles.requestButton, styles.acceptButton]}
                        onPress={() => handleAcceptFollowRequest(notification)}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.requestButton, styles.declineButton]}
                        onPress={() => handleRejectFollowRequest(notification)}
                      >
                        <Text style={styles.declineButtonText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-outline"
                size={64}
                color={palette.text.light.secondary}
              />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyDescription}>
                You're all caught up!
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
  markAllButton: {
    padding: spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  markAllText: {
    ...typography.caption,
    color: palette.primary[900],
    fontWeight: '600',
  },

  // Notifications List
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    padding: spacing.base,
  },

  // Notification Item
  notificationItem: {
    padding: spacing.md,
    backgroundColor: palette.accent.white,
    borderRadius: 12,
    marginBottom: spacing.sm,
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
  notificationItemUnread: {
    backgroundColor: palette.primary[50],
  },
  notificationTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  profilePicture: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.neutral[200],
    marginRight: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconContainerUnread: {
    backgroundColor: palette.primary[100],
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    ...typography.caption,
    color: palette.text.light.secondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.primary[900],
    marginLeft: spacing.sm,
  },

  // Follow Request Actions
  followRequestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  requestButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  acceptButton: {
    backgroundColor: palette.primary[900],
  },
  declineButton: {
    backgroundColor: palette.neutral[200],
  },
  acceptButtonText: {
    ...typography.body,
    color: palette.accent.white,
    fontWeight: '500',
  },
  declineButtonText: {
    ...typography.body,
    color: palette.text.light.primary,
    fontWeight: '500',
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
