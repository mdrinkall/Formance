/**
 * RootNavigator
 * Main navigation entry point
 * Handles auth flow vs app flow
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { LoadingScreen } from '../components/layout/LoadingScreen';

const Stack = createStackNavigator();

// Deep linking configuration
const linking = {
  prefixes: ['formance://'],
  config: {
    screens: {
      App: {
        screens: {
          Main: {
            screens: {
              Home: 'home',
              Profile: 'profile',
            },
          },
        },
      },
    },
  },
};

export const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
