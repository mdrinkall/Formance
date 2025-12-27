/**
 * OptionButton
 * Large tap target button for onboarding options
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';

interface OptionButtonProps {
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  description,
  selected = false,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <LinearGradient
        colors={
          selected
            ? ['rgba(233, 229, 214, 0.15)', 'rgba(233, 229, 214, 0.08)']
            : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.label, selected && styles.labelSelected]}>
          {label}
        </Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
        {selected && (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={palette.secondary[500]}
            style={styles.checkmark}
          />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const createShadow = (
  iosShadow: { shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number },
  androidElevation: number,
  webBoxShadow: string
) => {
  if (Platform.OS === 'web') {
    return { boxShadow: webBoxShadow };
  } else if (Platform.OS === 'android') {
    return { elevation: androidElevation };
  } else {
    return iosShadow;
  }
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    minHeight: 72,
    marginBottom: spacing.md,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  containerSelected: {
    borderColor: palette.secondary[500],
    ...createShadow(
      {
        shadowColor: palette.secondary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      6,
      '0 4px 12px rgba(233, 229, 214, 0.3)'
    ),
  },
  gradient: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 68,
  },
  label: {
    ...typography.body,
    fontSize: 17,
    color: palette.accent.white,
    fontWeight: '400',
    flex: 1,
  },
  labelSelected: {
    color: palette.secondary[500],
  },
  description: {
    ...typography.caption,
    fontSize: 13,
    color: palette.accent.white,
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  checkmark: {
    marginLeft: spacing.md,
  },
});
