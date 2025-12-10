/**
 * AnalysisScreen
 * Display AI analysis results for a swing
 * TODO: Implement analysis visualization and feedback
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { PlaceholderChart } from '../../components/charts/PlaceholderChart';

export default function AnalysisScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">Swing Analysis</Text>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-2">Overall Score</Text>
          <Text className="text-4xl font-bold text-blue-600">85/100</Text>
          <Text className="text-gray-600 mt-2">TODO: Display actual AI analysis score</Text>
        </Card>

        <PlaceholderChart title="Swing Metrics" height={200} />

        <Card className="mt-4">
          <Text className="text-lg font-semibold mb-2">Feedback</Text>
          <Text className="text-gray-600">TODO: Display AI-generated feedback</Text>
        </Card>

        <Card className="mt-4">
          <Text className="text-lg font-semibold mb-2">Improvement Areas</Text>
          <Text className="text-gray-600">TODO: Display improvement suggestions</Text>
        </Card>
      </View>
    </ScreenContainer>
  );
}
