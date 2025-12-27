/**
 * CoachingHistoryScreen
 * Onboarding Step 2: Ask about coaching experience
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { OnboardingWrapper } from '../../components/onboarding/OnboardingWrapper';
import { OptionButton } from '../../components/onboarding/OptionButton';
import { Button } from '../../components/ui/Button';
import { spacing } from '@/styles';

type Props = StackScreenProps<any, 'CoachingHistory'>;

const COACHING_OPTIONS = [
  {
    value: 'none',
    label: 'No',
  },
  {
    value: 'less_than_1',
    label: 'Yes – less than 1 year',
  },
  {
    value: '1_to_3',
    label: 'Yes – 1–3 years',
  },
  {
    value: '3_plus',
    label: 'Yes – 3+ years',
  },
];

export default function CoachingHistoryScreen({ navigation, route }: Props) {
  const [selectedCoaching, setSelectedCoaching] = useState<string | null>(null);
  const onboardingData = route.params?.onboardingData || {};

  const handleSkip = () => {
    // Set default and navigate to next screen
    navigation.navigate('Handicap', {
      onboardingData: {
        ...onboardingData,
        coaching_history: 'none', // Default
      },
    });
  };

  const handleContinue = () => {
    if (selectedCoaching) {
      navigation.navigate('Handicap', {
        onboardingData: {
          ...onboardingData,
          coaching_history: selectedCoaching,
        },
      });
    }
  };

  return (
    <OnboardingWrapper
      currentStep={2}
      totalSteps={4}
      stepLabel="COACHING"
      title="Have you ever had golf coaching?"
      onSkip={handleSkip}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {COACHING_OPTIONS.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            selected={selectedCoaching === option.value}
            onPress={() => setSelectedCoaching(option.value)}
          />
        ))}

        <Button
          title="Continue"
          variant="primary"
          onPress={handleContinue}
          disabled={!selectedCoaching}
          style={styles.continueButton}
        />
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
});
