/**
 * PaymentsScreen
 * Subscription and payment management
 * TODO: Implement payment processing with Stripe/RevenueCat
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function PaymentsScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">Subscription</Text>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-2">Current Plan</Text>
          <Text className="text-xl font-bold text-blue-600">Free</Text>
          <Text className="text-gray-600 mt-2">TODO: Display actual subscription info</Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Upgrade to Pro</Text>
          <Text className="text-gray-600 mb-4">Unlock premium features:</Text>
          <Text className="text-gray-600">• Unlimited swing analysis</Text>
          <Text className="text-gray-600">• Advanced statistics</Text>
          <Text className="text-gray-600">• Priority support</Text>
          <Button title="Upgrade Now" className="mt-4 bg-blue-600 py-3" />
        </Card>
      </View>
    </ScreenContainer>
  );
}
