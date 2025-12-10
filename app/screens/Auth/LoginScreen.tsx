/**
 * LoginScreen
 * User login with email/password
 * TODO: Implement Supabase authentication
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function LoginScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="flex-1 justify-center p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-8">Login</Text>
        <Input label="Email" placeholder="Enter your email" keyboardType="email-address" />
        <Input label="Password" placeholder="Enter your password" secureTextEntry />
        <Button title="Sign In" className="mt-6 bg-blue-600 py-4" />
        <Button title="Forgot Password?" variant="ghost" className="mt-4" />
      </View>
    </ScreenContainer>
  );
}
