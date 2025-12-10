/**
 * ScoreSetupScreen
 * Setup new round before scoring
 * TODO: Implement round setup (course, players, tees)
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function ScoreSetupScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">New Round Setup</Text>

        <Input label="Course Name" placeholder="Select or enter course" />
        <Input label="Number of Holes" placeholder="9 or 18" keyboardType="numeric" />
        <Input label="Tee Box" placeholder="Select tee box" />

        <View className="mt-6">
          <Text className="text-lg font-semibold mb-4">Players</Text>
          <Text className="text-gray-600 mb-4">TODO: Add player selection</Text>
        </View>

        <Button title="Start Round" className="mt-6 bg-blue-600 py-4" />
      </View>
    </ScreenContainer>
  );
}
