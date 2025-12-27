/**
 * ExperienceLevelScreen
 * Onboarding Step 1: Ask about golf experience
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { OnboardingWrapper } from '../../components/onboarding/OnboardingWrapper';
import { OptionButton } from '../../components/onboarding/OptionButton';
import { Button } from '../../components/ui/Button';
import { spacing } from '@/styles';

type Props = StackScreenProps<any, 'ExperienceLevel'>;

const EXPERIENCE_OPTIONS = [
  {
    value: 'less_than_1',
    label: 'Less than 1 year',
  },
  {
    value: '1_to_3',
    label: '1–3 years',
  },
  {
    value: '3_to_7',
    label: '3–7 years',
  },
  {
    value: '7_plus',
    label: '7+ years',
  },
];

export default function ExperienceLevelScreen({ navigation, route }: Props) {
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const onboardingData = route.params?.onboardingData || {};

  const handleSkip = () => {
    // Set default and navigate to next screen
    navigation.navigate('CoachingHistory', {
      onboardingData: {
        ...onboardingData,
        experience_level: '1_to_3', // Default
      },
    });
  };

  const handleContinue = () => {
    if (selectedExperience) {
      navigation.navigate('CoachingHistory', {
        onboardingData: {
          ...onboardingData,
          experience_level: selectedExperience,
        },
      });
    }
  };

  return (
    <OnboardingWrapper
      currentStep={1}
      totalSteps={4}
      stepLabel="EXPERIENCE"
      title="How long have you been playing golf?"
      onSkip={handleSkip}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {EXPERIENCE_OPTIONS.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            selected={selectedExperience === option.value}
            onPress={() => setSelectedExperience(option.value)}
          />
        ))}

        <Button
          title="Continue"
          variant="primary"
          onPress={handleContinue}
          disabled={!selectedExperience}
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
