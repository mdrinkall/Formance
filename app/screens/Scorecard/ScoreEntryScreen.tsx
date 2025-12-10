/**
 * ScoreEntryScreen
 * Enter scores during round
 * TODO: Implement hole-by-hole scoring
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function ScoreEntryScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">Hole 1</Text>

        <Card className="mb-4">
          <View className="flex-row justify-between mb-4">
            <Text className="text-gray-600">Par</Text>
            <Text className="text-xl font-bold">4</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Distance</Text>
            <Text className="text-lg">385 yards</Text>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Enter Score</Text>
          <View className="flex-row justify-around">
            {[3, 4, 5, 6, 7].map((score) => (
              <Button
                key={score}
                title={score.toString()}
                variant="outline"
                className="w-12 h-12"
              />
            ))}
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Additional Stats</Text>
          <Text className="text-gray-600">TODO: Fairway hit, GIR, Putts</Text>
        </Card>

        <Button title="Next Hole" className="mt-6 bg-blue-600 py-4" />
      </View>
    </ScreenContainer>
  );
}
