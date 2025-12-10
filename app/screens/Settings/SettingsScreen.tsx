/**
 * SettingsScreen
 * App settings and preferences
 * TODO: Implement settings management
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';

export default function SettingsScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">Settings</Text>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-2">Account</Text>
          <Text className="text-gray-600">TODO: Account settings</Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-2">Notifications</Text>
          <Text className="text-gray-600">TODO: Notification preferences</Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-2">Privacy</Text>
          <Text className="text-gray-600">TODO: Privacy settings</Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-2">Theme</Text>
          <Text className="text-gray-600">TODO: Theme toggle (light/dark)</Text>
        </Card>
      </View>
    </ScreenContainer>
  );
}
