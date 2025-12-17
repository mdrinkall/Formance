/**
 * Blocking Service
 * Handles user blocking/unblocking operations and relationship cleanup
 */

import { supabase } from './supabase';

export interface BlockRelationship {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

/**
 * Block a user - Creates block relationship and removes follows/requests
 * @param blockerId - User doing the blocking (current user)
 * @param blockedId - User being blocked
 */
export const blockUser = async (blockerId: string, blockedId: string): Promise<void> => {
  try {
    // 1. Insert block relationship
    const { error: blockError } = await supabase
      .from('blocks')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
      });

    if (blockError) throw blockError;

    // 2. Remove bidirectional follows if they exist
    const { error: followError } = await supabase
      .from('follows')
      .delete()
      .or(`and(follower_id.eq.${blockerId},following_id.eq.${blockedId}),and(follower_id.eq.${blockedId},following_id.eq.${blockerId})`);

    if (followError) console.error('Error removing follows:', followError);

    // 3. Delete any pending follow requests (bidirectional)
    const { error: requestError } = await supabase
      .from('follow_requests')
      .delete()
      .or(`and(requester_id.eq.${blockerId},requested_id.eq.${blockedId}),and(requester_id.eq.${blockedId},requested_id.eq.${blockerId})`);

    if (requestError) console.error('Error removing follow requests:', requestError);

  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
};

/**
 * Unblock a user
 * @param blockerId - User who created the block
 * @param blockedId - User being unblocked
 */
export const unblockUser = async (blockerId: string, blockedId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);

    if (error) throw error;
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
};

/**
 * Check if current user has blocked another user
 * @param blockerId - Current user's ID
 * @param blockedId - Target user's ID
 */
export const isUserBlocked = async (blockerId: string, blockedId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking block status:', error);
    return false;
  }
};

/**
 * Check if current user has been blocked by another user
 * @param userId - Current user's ID
 * @param potentialBlockerId - User who might have blocked current user
 */
export const hasUserBlockedMe = async (userId: string, potentialBlockerId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .select('id')
      .eq('blocker_id', potentialBlockerId)
      .eq('blocked_id', userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking if blocked by user:', error);
    return false;
  }
};

/**
 * Check bidirectional blocking status
 * Returns object indicating blocking relationship
 */
export const getBlockStatus = async (userId: string, otherUserId: string): Promise<{
  iBlockedThem: boolean;
  theyBlockedMe: boolean;
  isBlocked: boolean; // Either direction
}> => {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .select('blocker_id, blocked_id')
      .or(`and(blocker_id.eq.${userId},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${userId})`);

    if (error) throw error;

    const iBlockedThem = data?.some(block => block.blocker_id === userId) || false;
    const theyBlockedMe = data?.some(block => block.blocker_id === otherUserId) || false;

    return {
      iBlockedThem,
      theyBlockedMe,
      isBlocked: iBlockedThem || theyBlockedMe,
    };
  } catch (error) {
    console.error('Error getting block status:', error);
    return { iBlockedThem: false, theyBlockedMe: false, isBlocked: false };
  }
};

/**
 * Get list of user IDs that current user has blocked
 * Useful for filtering queries
 */
export const getBlockedUserIds = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', userId);

    if (error) throw error;
    return data?.map(block => block.blocked_id) || [];
  } catch (error) {
    console.error('Error getting blocked user IDs:', error);
    return [];
  }
};

/**
 * Get list of user IDs who have blocked current user
 * Useful for filtering queries
 */
export const getUserIdsWhoBlockedMe = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .select('blocker_id')
      .eq('blocked_id', userId);

    if (error) throw error;
    return data?.map(block => block.blocker_id) || [];
  } catch (error) {
    console.error('Error getting users who blocked me:', error);
    return [];
  }
};

/**
 * Get combined list of blocked users (bidirectional)
 * Use this to filter out all blocked relationships from queries
 */
export const getBlockedUsersFilter = async (userId: string): Promise<string[]> => {
  const blocked = await getBlockedUserIds(userId);
  const blockedBy = await getUserIdsWhoBlockedMe(userId);
  return [...new Set([...blocked, ...blockedBy])];
};
