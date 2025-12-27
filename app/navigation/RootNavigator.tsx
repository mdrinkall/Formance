/**
 * RootNavigator
 * Main navigation entry point
 * Handles auth flow vs app flow
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { LoadingScreen } from '../components/layout/LoadingScreen';
import { supabase } from '../services/supabase';
import ExperienceLevelScreen from '../screens/Onboarding/ExperienceLevelScreen';
import CoachingHistoryScreen from '../screens/Onboarding/CoachingHistoryScreen';
import HandicapScreen from '../screens/Onboarding/HandicapScreen';
import GoalScreen from '../screens/Onboarding/GoalScreen';

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
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const checkOnboardingStatus = async () => {
    if (!user) {
      setCheckingOnboarding(false);
      return;
    }

    try {
      setCheckingOnboarding(true);
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      // Check the explicit onboarding_completed flag
      setOnboardingComplete(profile?.onboarding_completed === true);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingComplete(false);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  // Set up a listener for profile changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        () => {
          // Re-check onboarding status when profile is updated
          checkOnboardingStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading || checkingOnboarding) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          onboardingComplete ? (
            <Stack.Screen name="App" component={AppNavigator} />
          ) : (
            <>
              <Stack.Screen name="ExperienceLevel" component={ExperienceLevelScreen} />
              <Stack.Screen name="CoachingHistory" component={CoachingHistoryScreen} />
              <Stack.Screen name="Handicap" component={HandicapScreen} />
              <Stack.Screen name="Goal" component={GoalScreen} />
            </>
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
