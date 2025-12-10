/**
 * PlaceholderChart component
 * Placeholder for charts (Victory Charts, react-native-chart-kit, etc.)
 * TODO: Implement actual charting library
 */

import React from 'react';
import { View, Text } from 'react-native';

interface PlaceholderChartProps {
  title?: string;
  height?: number;
}

export const PlaceholderChart: React.FC<PlaceholderChartProps> = ({
  title = 'Chart',
  height = 200,
}) => {
  return (
    <View className="bg-white rounded-lg p-4 border border-gray-200" style={{ height }}>
      <Text className="text-lg font-semibold text-gray-900 mb-4">{title}</Text>
      <View className="flex-1 items-center justify-center bg-gray-100 rounded">
        <Text className="text-gray-500">Chart Placeholder</Text>
        <Text className="text-gray-400 text-xs mt-2">TODO: Implement charting library</Text>
      </View>
    </View>
  );
};
