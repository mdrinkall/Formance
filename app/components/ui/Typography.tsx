/**
 * Typography components
 * Reusable text components with consistent styling
 */

import React, { ReactNode } from 'react';
import { Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  children: ReactNode;
}

export const Heading1: React.FC<TypographyProps> = ({ children, ...props }) => {
  return (
    <Text className="text-4xl font-bold text-gray-900" {...props}>
      {children}
    </Text>
  );
};

export const Heading2: React.FC<TypographyProps> = ({ children, ...props }) => {
  return (
    <Text className="text-3xl font-bold text-gray-900" {...props}>
      {children}
    </Text>
  );
};

export const Heading3: React.FC<TypographyProps> = ({ children, ...props }) => {
  return (
    <Text className="text-2xl font-semibold text-gray-900" {...props}>
      {children}
    </Text>
  );
};

export const Heading4: React.FC<TypographyProps> = ({ children, ...props }) => {
  return (
    <Text className="text-xl font-semibold text-gray-900" {...props}>
      {children}
    </Text>
  );
};

export const Body: React.FC<TypographyProps> = ({ children, ...props }) => {
  return (
    <Text className="text-base text-gray-700" {...props}>
      {children}
    </Text>
  );
};

export const BodySmall: React.FC<TypographyProps> = ({ children, ...props }) => {
  return (
    <Text className="text-sm text-gray-600" {...props}>
      {children}
    </Text>
  );
};

export const Caption: React.FC<TypographyProps> = ({ children, ...props }) => {
  return (
    <Text className="text-xs text-gray-500" {...props}>
      {children}
    </Text>
  );
};
