/**
 * OnboardingScreen - Landing/Welcome Page
 * Authentic iOS glass-morphism design with background image
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LiquidGlassButton } from '../../components/ui/LiquidGlassButton';
import { palette } from '../../theme/palette';
import { typography } from '@/styles';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const [showAuthButtons, setShowAuthButtons] = useState(false);

  // Animation values
  const getStartedAnimation = useRef(new Animated.Value(0)).current;
  const authButtonsAnimation = useRef(new Animated.Value(0)).current;

  const handleGetStarted = () => {
    // Animate Get Started button out
    Animated.timing(getStartedAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowAuthButtons(true);

      // Animate auth buttons in
      Animated.timing(authButtonsAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleAppleSignIn = () => {
    // TODO: Implement Apple Sign In
    if (__DEV__) console.log('Apple Sign In - Not implemented');
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign In
    if (__DEV__) console.log('Google Sign In - Not implemented');
  };

  const handleEmailSignIn = () => {
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
              {!showAuthButtons ? (
                // Get Started Button
                <Animated.View
                  style={[
                    styles.buttonWrapper,
                    {
                      opacity: getStartedAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0],
                      }),
                      transform: [
                        {
                          translateY: getStartedAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 100],
                          }),
                        },
                      ],
                    },
                  ]}
                >
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
                </Animated.View>
              ) : (
                // Auth Buttons
                <Animated.View
                  style={[
                    styles.authButtonsContainer,
                    {
                      opacity: authButtonsAnimation,
                      transform: [
                        {
                          translateY: authButtonsAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {/* Apple Sign In */}
                  <View style={styles.authButtonWrapper}>
                    <LiquidGlassButton
                      title="Continue with Apple"
                      onPress={handleAppleSignIn}
                      size="large"
                      variant="secondary"
                      tintColor="rgba(255, 255, 255, 0.15)"
                      style={glassButtonStyle}
                      textStyle={styles.authButtonText}
                      icon={<Ionicons name="logo-apple" size={24} color={palette.accent.white} />}
                      iconPosition="left"
                      fullWidth
                    />
                  </View>

                  {/* Google Sign In */}
                  <View style={styles.authButtonWrapper}>
                    <LiquidGlassButton
                      title="Continue with Google"
                      onPress={handleGoogleSignIn}
                      size="large"
                      variant="secondary"
                      tintColor="rgba(255, 255, 255, 0.15)"
                      style={glassButtonStyle}
                      textStyle={styles.authButtonText}
                      icon={<Ionicons name="logo-google" size={24} color={palette.accent.white} />}
                      iconPosition="left"
                      fullWidth
                    />
                  </View>

                  {/* Email Sign In */}
                  <View style={styles.authButtonWrapper}>
                    <LiquidGlassButton
                      title="Continue with Email"
                      onPress={handleEmailSignIn}
                      size="large"
                      variant="primary"
                      tintColor={`${palette.primary[900]}DD`}
                      style={glassButtonStyle}
                      textStyle={styles.authButtonText}
                      icon={<Ionicons name="mail" size={24} color={palette.accent.white} />}
                      iconPosition="left"
                      fullWidth
                    />
                  </View>
                </Animated.View>
              )}
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
  authButtonsContainer: {
    width: '100%',
    gap: height * 0.015,
  },
  authButtonWrapper: {
    width: '100%',
  },
  authButtonText: {
    ...typography.button,
    fontSize: 16,
    color: palette.accent.white,
    letterSpacing: 0.3,
  },
});