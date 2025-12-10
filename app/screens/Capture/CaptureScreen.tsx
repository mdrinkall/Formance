/**
 * CaptureScreen
 * Camera interface for capturing swing videos
 * TODO: Implement camera functionality with expo-camera
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Button } from '../../components/ui/Button';

export default function CaptureScreen() {
  return (
    <ScreenContainer>
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-xl mb-4">Camera View</Text>
        <Text className="text-gray-400 mb-8">TODO: Implement camera with expo-camera</Text>
        <Button title="Record Swing" className="bg-red-600 px-8 py-4" />
      </View>
    </ScreenContainer>
  );
}
