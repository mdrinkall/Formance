/**
 * SignupScreen
 * New user registration
 * TODO: Implement Supabase sign up
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function SignupScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="flex-1 justify-center p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-8">Sign Up</Text>
        <Input label="Full Name" placeholder="Enter your name" />
        <Input label="Email" placeholder="Enter your email" keyboardType="email-address" />
        <Input label="Password" placeholder="Create a password" secureTextEntry />
        <Input label="Confirm Password" placeholder="Confirm password" secureTextEntry />
        <Button title="Create Account" className="mt-6 bg-blue-600 py-4" />
      </View>
    </ScreenContainer>
  );
}
