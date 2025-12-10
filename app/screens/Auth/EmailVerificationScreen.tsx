/**
 * EmailVerificationScreen
 * Email verification after signup
 * TODO: Implement email verification with Supabase
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Button } from '../../components/ui/Button';

export default function EmailVerificationScreen() {
  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Verify Your Email</Text>
        <Text className="text-base text-gray-600 text-center mb-8">
          We've sent a verification link to your email. Please check your inbox.
        </Text>
        <Button title="Resend Email" variant="outline" />
      </View>
    </ScreenContainer>
  );
}
