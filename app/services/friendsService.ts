/**
 * Friends service
 * Handles friend-related operations
 * TODO: Implement actual friend management logic
 */

import { supabase } from './supabase';

export type Friend = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  handicap: number | null;
  status: 'pending' | 'accepted' | 'blocked';
};

/**
 * Send a friend request
 * @param userId - Current user ID
 * @param friendId - Friend user ID
 */
export const sendFriendRequest = async (userId: string, friendId: string) => {
  // TODO: Implement send friend request
  throw new Error('Not implemented');
};

/**
 * Accept a friend request
 * @param requestId - Friend request ID
 */
export const acceptFriendRequest = async (requestId: string) => {
  // TODO: Implement accept friend request
  throw new Error('Not implemented');
};

/**
 * Reject a friend request
 * @param requestId - Friend request ID
 */
export const rejectFriendRequest = async (requestId: string) => {
  // TODO: Implement reject friend request
  throw new Error('Not implemented');
};

/**
 * Remove a friend
 * @param userId - Current user ID
 * @param friendId - Friend user ID
 */
export const removeFriend = async (userId: string, friendId: string) => {
  // TODO: Implement remove friend
  throw new Error('Not implemented');
};

/**
 * Get pending friend requests
 * @param userId - Current user ID
 */
export const getPendingRequests = async (userId: string) => {
  // TODO: Implement get pending requests
  throw new Error('Not implemented');
};

/**
 * Block a user
 * @param userId - Current user ID
 * @param blockedUserId - User to block
 */
export const blockUser = async (userId: string, blockedUserId: string) => {
  // TODO: Implement block user
  throw new Error('Not implemented');
};

/**
 * Unblock a user
 * @param userId - Current user ID
 * @param blockedUserId - User to unblock
 */
export const unblockUser = async (userId: string, blockedUserId: string) => {
  // TODO: Implement unblock user
  throw new Error('Not implemented');
};

/**
 * Get friend's recent activity
 * @param friendId - Friend user ID
 */
export const getFriendActivity = async (friendId: string) => {
  // TODO: Implement get friend activity
  throw new Error('Not implemented');
};
