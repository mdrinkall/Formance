/**
 * GoalScreen
 * Onboarding Step 4: Ask about main goal
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import { OnboardingWrapper } from '../../components/onboarding/OnboardingWrapper';
import { OptionButton } from '../../components/onboarding/OptionButton';
import { Button } from '../../components/ui/Button';
import { spacing } from '@/styles';
import { palette } from '@/theme/palette';
import { useAuthContext } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';

type Props = StackScreenProps<any, 'Goal'>;

const GOAL_OPTIONS = [
  {
    value: 'consistency',
    label: 'Hit the ball more consistently',
  },
  {
    value: 'technique',
    label: 'Improve swing technique',
  },
  {
    value: 'lower_handicap',
    label: 'Lower my handicap',
  },
  {
    value: 'getting_started',
    label: 'Just getting started / learning basics',
  },
];

export default function GoalScreen({ navigation, route }: Props) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();
  const onboardingData = route.params?.onboardingData || {};

  const handleSkip = async () => {
    // Set all defaults and save
    // Make sure we have defaults for all fields so onboarding is marked complete
    const completeData = {
      experience_level: onboardingData.experience_level || '1_to_3',
      coaching_history: onboardingData.coaching_history || 'none',
      handicap: onboardingData.handicap || null,
    };

    if (!user?.id) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          ...completeData,
          swing_goal: 'consistency',
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving onboarding data:', error);
      }
    } catch (error) {
      console.error('Error in handleSkip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (selectedGoal) {
      await saveOnboardingData(selectedGoal);
    }
  };

  const saveOnboardingData = async (goal: string) => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Save all onboarding data to profile
      const { error } = await supabase
        .from('profiles')
        .update({
          experience_level: onboardingData.experience_level,
          coaching_history: onboardingData.coaching_history,
          handicap: onboardingData.handicap,
          swing_goal: goal,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving onboarding data:', error);
        return;
      }

      // RootNavigator is listening for profile changes and will automatically
      // navigate to the main app once it detects onboarding is complete
    } catch (error) {
      console.error('Error in saveOnboardingData:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingWrapper
      currentStep={4}
      totalSteps={4}
      stepLabel="GOAL"
      title="What's your main goal right now?"
      subtitle="This helps us personalize your experience"
      onSkip={handleSkip}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {GOAL_OPTIONS.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            selected={selectedGoal === option.value}
            onPress={() => setSelectedGoal(option.value)}
          />
        ))}

        <Button
          title={loading ? 'Saving...' : 'Get Started'}
          variant="primary"
          onPress={handleContinue}
          disabled={!selectedGoal || loading}
          style={styles.continueButton}
        />

        {loading && (
          <ActivityIndicator
            size="small"
            color={palette.secondary[500]}
            style={styles.loadingIndicator}
          />
        )}
      </ScrollView>
    </OnboardingWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  continueButton: {
    marginTop: spacing.lg,
  },
  loadingIndicator: {
    marginTop: spacing.md,
  },
});
