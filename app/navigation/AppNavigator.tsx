/**
 * AppNavigator
 * Main app navigation after authentication
 * Contains tab navigator and modal screens
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabNavigator } from './TabNavigator';
import { SocialNavigator } from './SocialNavigator';
import { ScoreNavigator } from './ScoreNavigator';
import { AnalysisNavigator } from './AnalysisNavigator';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import PaymentsScreen from '../screens/Payments/PaymentsScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Stack = createStackNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Analysis" component={AnalysisNavigator} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Social" component={SocialNavigator} />
      <Stack.Screen name="Score" component={ScoreNavigator} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};
