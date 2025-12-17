/**
 * useBlocking Hook
 * Manages blocking state with per-user caching
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import {
  getBlockStatus,
  blockUser as blockUserService,
  unblockUser as unblockUserService,
} from '../services/blockingService';

interface BlockStatus {
  iBlockedThem: boolean;
  theyBlockedMe: boolean;
  isBlocked: boolean;
}

interface UseBlockingReturn {
  blockStatus: BlockStatus;
  loading: boolean;
  blockUser: () => Promise<void>;
  unblockUser: () => Promise<void>;
  refreshBlockStatus: () => Promise<void>;
}

/**
 * Hook for managing block status with a specific user
 * @param targetUserId - The user to check blocking status against
 */
export const useBlocking = (targetUserId: string | null): UseBlockingReturn => {
  const { user: currentUser } = useAuthContext();
  const [blockStatus, setBlockStatus] = useState<BlockStatus>({
    iBlockedThem: false,
    theyBlockedMe: false,
    isBlocked: false,
  });
  const [loading, setLoading] = useState(false);

  // Load block status on mount and when IDs change
  const loadBlockStatus = useCallback(async () => {
    if (!currentUser || !targetUserId) {
      setBlockStatus({ iBlockedThem: false, theyBlockedMe: false, isBlocked: false });
      return;
    }

    try {
      setLoading(true);
      const status = await getBlockStatus(currentUser.id, targetUserId);
      setBlockStatus(status);
    } catch (error) {
      console.error('Error loading block status:', error);
      setBlockStatus({ iBlockedThem: false, theyBlockedMe: false, isBlocked: false });
    } finally {
      setLoading(false);
    }
  }, [currentUser, targetUserId]);

  useEffect(() => {
    loadBlockStatus();
  }, [loadBlockStatus]);

  // Block user with optimistic update
  const blockUser = useCallback(async () => {
    if (!currentUser || !targetUserId) return;

    // Optimistic update
    setBlockStatus({
      iBlockedThem: true,
      theyBlockedMe: blockStatus.theyBlockedMe,
      isBlocked: true,
    });

    try {
      await blockUserService(currentUser.id, targetUserId);
    } catch (error) {
      console.error('Error blocking user:', error);
      // Rollback optimistic update on error
      await loadBlockStatus();
      throw error;
    }
  }, [currentUser, targetUserId, blockStatus.theyBlockedMe, loadBlockStatus]);

  // Unblock user with optimistic update
  const unblockUser = useCallback(async () => {
    if (!currentUser || !targetUserId) return;

    // Optimistic update
    setBlockStatus({
      iBlockedThem: false,
      theyBlockedMe: blockStatus.theyBlockedMe,
      isBlocked: blockStatus.theyBlockedMe, // Still blocked if they blocked me
    });

    try {
      await unblockUserService(currentUser.id, targetUserId);
    } catch (error) {
      console.error('Error unblocking user:', error);
      // Rollback optimistic update on error
      await loadBlockStatus();
      throw error;
    }
  }, [currentUser, targetUserId, blockStatus.theyBlockedMe, loadBlockStatus]);

  return {
    blockStatus,
    loading,
    blockUser,
    unblockUser,
    refreshBlockStatus: loadBlockStatus,
  };
};
