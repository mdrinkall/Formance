/**
 * Divider component
 * Visual separator with NativeWind styling
 */

import React from 'react';
import { View, ViewProps } from 'react-native';

interface DividerProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  ...props
}) => {
  const classes = orientation === 'horizontal'
    ? 'h-px w-full bg-gray-200'
    : 'w-px h-full bg-gray-200';

  return <View className={classes} {...props} />;
};
