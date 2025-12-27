/**
 * HandicapScreen
 * Onboarding Step 3: Ask about handicap (optional)
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Platform } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { OnboardingWrapper } from '../../components/onboarding/OnboardingWrapper';
import { OptionButton } from '../../components/onboarding/OptionButton';
import { Button } from '../../components/ui/Button';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';

type Props = StackScreenProps<any, 'Handicap'>;

export default function HandicapScreen({ navigation, route }: Props) {
  const [hasHandicap, setHasHandicap] = useState<boolean | null>(null);
  const [handicapValue, setHandicapValue] = useState<string>('');
  const onboardingData = route.params?.onboardingData || {};

  const handleSkip = () => {
    // Set default (null handicap) and navigate to next screen
    navigation.navigate('Goal', {
      onboardingData: {
        ...onboardingData,
        handicap: null,
      },
    });
  };

  const handleContinue = () => {
    const handicap = hasHandicap && handicapValue ? parseFloat(handicapValue) : null;
    navigation.navigate('Goal', {
      onboardingData: {
        ...onboardingData,
        handicap,
      },
    });
  };

  const handleHandicapSelect = (value: boolean) => {
    setHasHandicap(value);
    if (!value) {
      setHandicapValue(''); // Clear handicap value if they select "No"
    }
  };

  const isValid = hasHandicap === false || (hasHandicap === true && handicapValue !== '');

  return (
    <OnboardingWrapper
      currentStep={3}
      totalSteps={4}
      stepLabel="HANDICAP"
      title="Do you have a handicap?"
      subtitle="This helps us give you personalized feedback"
      onSkip={handleSkip}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <OptionButton
          label="No"
          selected={hasHandicap === false}
          onPress={() => handleHandicapSelect(false)}
        />

        <OptionButton
          label="Yes"
          selected={hasHandicap === true}
          onPress={() => handleHandicapSelect(true)}
        />

        {hasHandicap === true && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Enter your handicap</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 18.5"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={handicapValue}
              onChangeText={setHandicapValue}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
        )}

        <Button
          title="Continue"
          variant="primary"
          onPress={handleContinue}
          disabled={!isValid}
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
  inputContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.base,
  },
  inputLabel: {
    ...typography.label,
    color: palette.accent.white,
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  input: {
    ...typography.body,
    fontSize: 17,
    color: palette.accent.white,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    height: 56,
    outlineStyle: 'none',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  continueButton: {
    marginTop: spacing.lg,
  },
});
