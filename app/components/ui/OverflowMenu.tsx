/**
 * OverflowMenu - Reusable three-dot menu component
 * Displays action sheet-style menu with list of actions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';

export interface MenuAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean; // Red text for destructive actions
  disabled?: boolean;
}

interface OverflowMenuProps {
  visible: boolean;
  onClose: () => void;
  actions: MenuAction[];
}

export const OverflowMenu: React.FC<OverflowMenuProps> = ({
  visible,
  onClose,
  actions,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Menu Container */}
        <View style={styles.menuContainer}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === actions.length - 1 && styles.menuItemLast,
                action.disabled && styles.menuItemDisabled,
              ]}
              onPress={() => {
                if (!action.disabled) {
                  action.onPress();
                  onClose();
                }
              }}
              disabled={action.disabled}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <Ionicons
                name={action.icon}
                size={24}
                color={
                  action.disabled
                    ? palette.text.light.secondary
                    : action.destructive
                    ? palette.error
                    : palette.text.light.primary
                }
              />
              <Text
                style={[
                  styles.menuItemText,
                  action.destructive && styles.menuItemTextDestructive,
                  action.disabled && styles.menuItemTextDisabled,
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    ...Platform.select({
      web: {
        cursor: 'default',
      },
    }),
  },
  menuContainer: {
    backgroundColor: palette.accent.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.base,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.light,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemDisabled: {
    opacity: 0.5,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      },
    }),
  },
  menuItemText: {
    ...typography.body,
    marginLeft: spacing.base,
    flex: 1,
  },
  menuItemTextDestructive: {
    color: palette.error,
  },
  menuItemTextDisabled: {
    color: palette.text.light.secondary,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
    marginTop: spacing.sm,
    minHeight: 56,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  cancelButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: palette.primary[900],
  },
});
