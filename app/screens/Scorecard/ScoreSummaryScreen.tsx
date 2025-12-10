/**
 * ScoreSummaryScreen
 * Display completed round summary
 * TODO: Implement round summary with stats
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function ScoreSummaryScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">Round Complete!</Text>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-2">Final Score</Text>
          <Text className="text-5xl font-bold text-blue-600 mb-1">89</Text>
          <Text className="text-gray-600">+17 (Par 72)</Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Statistics</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Fairways Hit</Text>
            <Text className="font-semibold">8/14 (57%)</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Greens in Regulation</Text>
            <Text className="font-semibold">6/18 (33%)</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Total Putts</Text>
            <Text className="font-semibold">32</Text>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-2">Scorecard</Text>
          <Text className="text-gray-600">TODO: Display hole-by-hole scores</Text>
        </Card>

        <Button title="Share Round" variant="outline" className="mb-2" />
        <Button title="Back to Home" className="bg-blue-600 py-4" />
      </View>
    </ScreenContainer>
  );
}
