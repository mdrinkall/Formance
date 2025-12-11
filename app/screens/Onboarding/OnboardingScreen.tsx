/**
 * OnboardingScreen - Landing/Welcome Page
 * Authentic iOS glass-morphism design with background image
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LiquidGlassButton } from '../../components/ui/LiquidGlassButton';
import { palette } from '../../theme/palette';
import { typography } from '@/styles';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  // Shared style for glass button border
  const glassButtonStyle = {
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  };

  return (
    <View style={styles.container}>
      {/* Background Image with Overlay */}
      <ImageBackground
        source={require('../../assets/images/landing-page.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Gradient Overlay */}
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.4)',
            'rgba(0, 0, 0, 0.2)',
            'rgba(0, 0, 0, 0.5)',
          ]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Title Section */}
            <View style={styles.titleContainer}>
              <Text style={styles.subtitle}>LOVE YOUR SWING</Text>
              <Text style={styles.title}>FORMANCE</Text>
              <Text style={styles.tagline}>
                Smarter swing analysis and game tracking for golfers everywhere.
              </Text>
            </View>

            {/* Button Container */}
            <View style={styles.buttonContainer}>
              <View style={styles.buttonWrapper}>
                <LiquidGlassButton
                  title="Get Started"
                  onPress={handleGetStarted}
                  size="large"
                  variant="secondary"
                  tintColor="rgba(255, 255, 255, 0.15)"
                  style={glassButtonStyle}
                  textStyle={styles.buttonText}
                  fullWidth
                />
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background.dark,
  },
  backgroundImage: {
    flex: 1,
    width,
    height,
  },
  gradient: {
    flex: 1,
    width,
    height,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.06,
  },
  titleContainer: {
    marginTop: height * 0.1,
    alignItems: 'flex-start',
    paddingRight: width * 0.05,
  },
  subtitle: {
    ...typography.body,
    color: palette.accent.white,
    letterSpacing: 2,
    marginBottom: 4,
    opacity: 0.9,
  },
  title: {
    ...typography.h1,
    color: palette.accent.white,
    letterSpacing: 1,
    marginBottom: 16,
  },
  tagline: {
    ...typography.bodySmall,
    color: palette.accent.white,
    opacity: 0.85,
    marginTop: 8,
  },
  buttonContainer: {
    marginBottom: height * 0.08,
    alignItems: 'center',
    paddingHorizontal: width * 0.02,
  },
  buttonWrapper: {
    width: '100%',
  },
  buttonText: {
    ...typography.button,
    color: palette.accent.white,
    letterSpacing: 0.5,
  },
});