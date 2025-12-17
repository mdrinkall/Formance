/**
 * BlockConfirmationModal
 * Confirmation dialog for blocking/unblocking users
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface BlockConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username: string;
  isBlocked: boolean; // true = unblock, false = block
  loading?: boolean;
}

export const BlockConfirmationModal: React.FC<BlockConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  username,
  isBlocked,
  loading = false,
}) => {
  const action = isBlocked ? 'Unblock' : 'Block';
  const title = isBlocked ? 'Unblock User?' : 'Block User?';
  const message = isBlocked
    ? `You will be able to see ${username}'s content and interact with them again.`
    : `${username} will not be able to see your profile, posts, or recordings. You will not see their content either. Existing follows and follow requests will be removed.`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Card style={styles.modalCard}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              variant="outline"
              style={styles.button}
              onPress={onClose}
              disabled={loading}
            />
            <Button
              title={action}
              variant="primary"
              style={[styles.button, !isBlocked && styles.destructiveButton]}
              onPress={onConfirm}
              loading={loading}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.xl,
  },
  title: {
    ...typography.h4,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: palette.text.light.secondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
  destructiveButton: {
    backgroundColor: palette.error,
  },
});
