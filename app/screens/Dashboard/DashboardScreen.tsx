/**
 * DashboardScreen
 * Detailed stats and analytics dashboard
 * TODO: Implement comprehensive analytics
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { PlaceholderChart } from '../../components/charts/PlaceholderChart';

export default function DashboardScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">Dashboard</Text>

        <PlaceholderChart title="Score Trend" height={200} />

        <View className="mt-4">
          <PlaceholderChart title="Practice Time" height={200} />
        </View>

        <View className="mt-4">
          <PlaceholderChart title="Swing Consistency" height={200} />
        </View>
      </View>
    </ScreenContainer>
  );
}
