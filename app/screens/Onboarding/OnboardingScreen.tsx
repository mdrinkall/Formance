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
import { palette } from '../../theme/palette';
// Updated Import
import { LiquidGlassButton } from '../../components/ui/LiquidGlassButton';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [showAuthButtons, setShowAuthButtons] = useState(false);

  // Animation values
  const getStartedAnimation = useRef(new Animated.Value(0)).current;
  const authButtonsAnimation = useRef(new Animated.Value(0)).current;

  const handleGetStarted = () => {
    console.log('Get Started pressed');

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
    console.log('Apple Sign In pressed');
    // TODO: Implement Apple Sign In
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign In pressed');
    // TODO: Implement Google Sign In
  };

  const handleEmailSignIn = () => {
    console.log('Email Sign In pressed');
    // TODO: Navigate to email sign in
  };

  // Shared style for preserving the specific border look of your original design
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
        {/* Gradient Overlay for better text readability */}
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
                      icon={<Ionicons name="logo-apple" size={24} color="#FFFFFF" />}
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
                      icon={<Ionicons name="logo-google" size={24} color="#FFFFFF" />}
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
                      // Keeping your specific Green tint
                      tintColor={`${palette.primary[900]}DD`}
                      style={glassButtonStyle}
                      textStyle={styles.authButtonText}
                      icon={<Ionicons name="mail" size={24} color="#FFFFFF" />}
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
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  gradient: {
    flex: 1,
    width: width,
    height: height,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.06, // 6% of screen width
    paddingVertical: height * 0.025, // 2.5% of screen height
  },
  titleContainer: {
    marginTop: height * 0.1, // 10% from top
    alignItems: 'flex-start',
    paddingRight: width * 0.05, // Ensure text doesn't touch edges
  },
  subtitle: {
    fontSize: Math.min(width * 0.04, 16), // Responsive but max 16
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 4,
    opacity: 0.9,
  },
  title: {
    fontSize: Math.min(width * 0.12, 48), // Responsive but max 48
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    lineHeight: Math.min(width * 0.14, 56), // Proportional line height
    marginBottom: 16,
  },
  tagline: {
    fontSize: Math.min(width * 0.038, 15), // Responsive but max 15
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: Math.min(width * 0.055, 22), // Proportional line height
    opacity: 0.85,
    marginTop: 8,
  },
  buttonContainer: {
    marginBottom: height * 0.08, // 8% from bottom
    alignItems: 'center',
    paddingHorizontal: width * 0.02,
  },
  buttonWrapper: {
    width: '100%',
  },
  /* Removed manual glassButton styles as they are now handled by the component props */
  buttonText: {
    fontSize: Math.min(width * 0.045, 18), // Responsive but max 18
    fontWeight: '600',
    color: '#FFFFFF', // White text for glass button
    letterSpacing: 0.5,
  },
  authButtonsContainer: {
    width: '100%',
    gap: height * 0.015, // Responsive gap
  },
  authButtonWrapper: {
    width: '100%',
  },
  authButtonText: {
    fontSize: Math.min(width * 0.04, 16), // Responsive but max 16
    fontWeight: '600', // Bold text for glass effect
    color: '#FFFFFF', // White text
    letterSpacing: 0.3,
  },
});