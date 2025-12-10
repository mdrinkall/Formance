/**
 * AddFriendsScreen
 * Search and add friends
 * TODO: Implement friend search and requests
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function AddFriendsScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">Add Friends</Text>

        <Input
          placeholder="Search by name or email"
          className="mb-6"
        />

        <Text className="text-lg font-semibold mb-4">Suggestions</Text>

        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 bg-gray-300 rounded-full mr-3" />
              <View>
                <Text className="text-lg font-semibold">Mike Johnson</Text>
                <Text className="text-gray-600 text-sm">2 mutual friends</Text>
              </View>
            </View>
            <Button title="Add" size="sm" className="bg-blue-600 px-4 py-2" />
          </View>
        </Card>

        <Text className="text-gray-500 text-sm mt-4">TODO: Implement friend search and add</Text>
      </View>
    </ScreenContainer>
  );
}
