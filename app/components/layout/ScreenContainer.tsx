/**
 * ScreenContainer component
 * Wrapper for screen content with safe area handling
 */

import React, { ReactNode } from 'react';
import { View, ScrollView, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
  children: ReactNode;
  scrollable?: boolean;
  safeArea?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  safeArea = true,
  ...props
}) => {
  const Container = safeArea ? SafeAreaView : View;

  if (scrollable) {
    return (
      <Container className="flex-1 bg-white" {...props}>
        <ScrollView className="flex-1" contentContainerClassName="p-4">
          {children}
        </ScrollView>
      </Container>
    );
  }

  return (
    <Container className="flex-1 bg-white" {...props}>
      {children}
    </Container>
  );
};
