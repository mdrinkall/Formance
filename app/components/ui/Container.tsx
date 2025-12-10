/**
 * Container component
 * Reusable container with consistent spacing and layout
 */

import React, { ReactNode } from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';
import { spacing } from '../../styles/spacing';

interface ContainerProps extends ViewProps {
  children: ReactNode;
  centered?: boolean;
  padding?: keyof typeof spacing;
  style?: ViewStyle;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  centered = false,
  padding,
  style,
  ...props
}) => {
  const paddingStyle = padding ? { padding: spacing[padding] } : {};

  return (
    <View
      style={[
        centered ? commonStyles.containerCentered : commonStyles.container,
        paddingStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

interface SectionProps extends ViewProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const Section: React.FC<SectionProps> = ({ children, style, ...props }) => {
  return (
    <View style={[commonStyles.section, style]} {...props}>
      {children}
    </View>
  );
};
