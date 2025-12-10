/**
 * HistoryScreen
 * View past swings and rounds
 * TODO: Implement history list with filtering
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';

export default function HistoryScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">History</Text>

        <Card className="mb-4">
          <Text className="text-lg font-semibold">Swing - March 15, 2024</Text>
          <Text className="text-gray-600 mt-2">Score: 82/100</Text>
          <Text className="text-gray-500 text-sm mt-1">TODO: Display actual history items</Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-semibold">Round - March 14, 2024</Text>
          <Text className="text-gray-600 mt-2">Score: 89 (+17)</Text>
          <Text className="text-gray-500 text-sm mt-1">TODO: Display actual history items</Text>
        </Card>
      </View>
    </ScreenContainer>
  );
}
