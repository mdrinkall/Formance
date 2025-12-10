import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import { styles } from './LiquidGlassButton.styles';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface LiquidGlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  tintColor?: string;
  effect?: 'clear' | 'regular';
}

const VARIANT_COLORS = {
  primary: '#0A6334',
  secondary: '#F7F2E8',
  outline: 'transparent',
  ghost: 'transparent',
  danger: '#FF3B30',
};

const VARIANT_TINTS = {
  primary: '#0A6334',
  secondary: '#F7F2E8',
  outline: 'rgba(0, 122, 255, 0.1)',
  ghost: 'rgba(255, 255, 255, 0.05)',
  danger: '#FF3B30',
};

export function LiquidGlassButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  tintColor,
  effect = 'regular',
}: LiquidGlassButtonProps) {
  const isInteractive = !disabled && !loading;
  const variantTint = tintColor || VARIANT_TINTS[variant];
  const fallbackColor = VARIANT_COLORS[variant];

  // Determine if we should use glass effect or fallback
  const useGlass = variant !== 'outline' && variant !== 'ghost';

  const buttonContent = (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#007AFF'}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={[styles.iconContainer, styles.iconLeft]}>{icon}</View>
          )}
          <Text
            style={[
              styles.baseText,
              styles[`${size}Text`],
              styles[`${variant}Text`],
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={[styles.iconContainer, styles.iconRight]}>{icon}</View>
          )}
        </>
      )}
    </View>
  );

  const pressableContent = (
    <Pressable
      onPress={onPress}
      disabled={!isInteractive}
      style={({ pressed }) => [
        styles.pressable,
        styles[`${size}Pressable`],
        pressed && isInteractive && styles.pressed,
      ]}
    >
      {buttonContent}
    </Pressable>
  );

  // For outline and ghost variants, use regular View
  if (!useGlass) {
    return (
      <View
        style={[
          styles.button,
          styles[`${size}Button`],
          styles[`${variant}Button`],
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
      >
        {pressableContent}
      </View>
    );
  }

  // For glass variants, use LiquidGlassView
  return (
    <LiquidGlassView
      style={[
        styles.button,
        styles[`${size}Button`],
        styles[`${variant}Button`],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        !isLiquidGlassSupported && {
          backgroundColor: fallbackColor + (variant === 'primary' || variant === 'danger' ? 'CC' : '40'),
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: variant === 'secondary' ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
        },
        style,
      ]}
      interactive={isInteractive}
      effect={effect}
      tintColor={variantTint}
      colorScheme="system"
    >
      {pressableContent}
    </LiquidGlassView>
  );
}
