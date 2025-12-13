/**
 * SelectionCard
 * Reusable card for selection lists (club, shot shape, etc.)
 */

import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform, ViewStyle, TextStyle } from 'react-native';
import { palette } from '../../theme/palette';
import { spacing, typography } from '../../styles';

interface SelectionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  icon?: ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  label,
  description,
  selected,
  onPress,
  icon,
  style,
  labelStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selected, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}${selected ? ', selected' : ''}`}
      accessibilityHint="Double tap to select this option"
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.textContainer}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.base,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: spacing.md,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
  selected: {
    borderColor: palette.secondary[500],
    backgroundColor: palette.secondary[500],
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...typography.body,
    color: palette.accent.white,
    fontWeight: '600',
  },
  description: {
    ...typography.caption,
    color: palette.accent.white,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
});
