/**
 * AuthNavigator
 * Handles authentication flow screens
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import EmailVerificationScreen from '../screens/Auth/EmailVerificationScreen';
import ExperienceLevelScreen from '../screens/Onboarding/ExperienceLevelScreen';
import CoachingHistoryScreen from '../screens/Onboarding/CoachingHistoryScreen';
import HandicapScreen from '../screens/Onboarding/HandicapScreen';
import GoalScreen from '../screens/Onboarding/GoalScreen';

const Stack = createStackNavigator();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="ExperienceLevel" component={ExperienceLevelScreen} />
      <Stack.Screen name="CoachingHistory" component={CoachingHistoryScreen} />
      <Stack.Screen name="Handicap" component={HandicapScreen} />
      <Stack.Screen name="Goal" component={GoalScreen} />
    </Stack.Navigator>
  );
};
