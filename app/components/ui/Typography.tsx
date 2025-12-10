/**
 * Typography components
 * Reusable text components with consistent styling
 */

import React, { ReactNode } from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { typography } from '../../styles/typography';

interface TypographyProps extends TextProps {
  children: ReactNode;
  style?: TextStyle;
  dark?: boolean;
}

export const Heading1: React.FC<TypographyProps> = ({ children, style, dark, ...props }) => {
  return (
    <Text style={[dark ? typography.h1Dark : typography.h1, style]} {...props}>
      {children}
    </Text>
  );
};

export const Heading2: React.FC<TypographyProps> = ({ children, style, dark, ...props }) => {
  return (
    <Text style={[dark ? typography.h2Dark : typography.h2, style]} {...props}>
      {children}
    </Text>
  );
};

export const Heading3: React.FC<TypographyProps> = ({ children, style, ...props }) => {
  return (
    <Text style={[typography.h3, style]} {...props}>
      {children}
    </Text>
  );
};

export const Heading4: React.FC<TypographyProps> = ({ children, style, ...props }) => {
  return (
    <Text style={[typography.h4, style]} {...props}>
      {children}
    </Text>
  );
};

export const Body: React.FC<TypographyProps> = ({ children, style, dark, ...props }) => {
  return (
    <Text style={[dark ? typography.bodyDark : typography.body, style]} {...props}>
      {children}
    </Text>
  );
};

export const BodyLarge: React.FC<TypographyProps> = ({ children, style, ...props }) => {
  return (
    <Text style={[typography.bodyLarge, style]} {...props}>
      {children}
    </Text>
  );
};

export const BodySmall: React.FC<TypographyProps> = ({ children, style, ...props }) => {
  return (
    <Text style={[typography.bodySmall, style]} {...props}>
      {children}
    </Text>
  );
};

export const Caption: React.FC<TypographyProps> = ({ children, style, ...props }) => {
  return (
    <Text style={[typography.caption, style]} {...props}>
      {children}
    </Text>
  );
};

export const Label: React.FC<TypographyProps> = ({ children, style, ...props }) => {
  return (
    <Text style={[typography.label, style]} {...props}>
      {children}
    </Text>
  );
};
