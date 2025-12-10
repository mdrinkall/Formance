/**
 * ForgotPasswordScreen
 * Password reset flow
 * TODO: Implement password reset with Supabase
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function ForgotPasswordScreen() {
  return (
    <ScreenContainer>
      <View className="flex-1 justify-center p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-4">Reset Password</Text>
        <Text className="text-base text-gray-600 mb-8">
          Enter your email to receive password reset instructions
        </Text>
        <Input label="Email" placeholder="Enter your email" keyboardType="email-address" />
        <Button title="Send Reset Link" className="mt-6 bg-blue-600 py-4" />
      </View>
    </ScreenContainer>
  );
}
