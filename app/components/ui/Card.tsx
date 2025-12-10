/**
 * Card component
 * Reusable card container with NativeWind styling
 */

import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  ...props
}) => {
  // TODO: Implement card variants using NativeWind classes
  const baseClasses = 'bg-white rounded-lg p-4';

  return (
    <View className={baseClasses} {...props}>
      {children}
    </View>
  );
};
