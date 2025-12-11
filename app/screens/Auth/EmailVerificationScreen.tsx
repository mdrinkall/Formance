/**
 * EmailVerificationScreen
 * Email verification confirmation screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../services/supabase';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type EmailVerificationScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: {
    params?: {
      email?: string;
    };
  };
};

const { width, height } = Dimensions.get('window');

export default function EmailVerificationScreen({ navigation, route }: EmailVerificationScreenProps) {
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');
  const email = route.params?.email || '';

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address not found');
      return;
    }

    try {
      setResending(true);
      setError('');
      setResendSuccess(false);

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (resendError) throw resendError;

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/landing-page.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(26, 77, 46, 0.85)', 'rgba(15, 20, 25, 0.95)']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.content}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="mail-outline" size={64} color={palette.primary[900]} />
                </View>
              </View>

              {/* Title */}
              <Text style={styles.title}>Verify Your Email</Text>

              {/* Description */}
              <Text style={styles.description}>
                We've sent a verification link to
              </Text>
              {email && <Text style={styles.email}>{email}</Text>}
              <Text style={styles.description}>
                Please check your inbox and click the verification link to activate your account.
              </Text>

              {/* Info Box */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color={palette.primary[900]} style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  Don't forget to check your spam or junk folder if you don't see the email.
                </Text>
              </View>

              {/* Success Message */}
              {resendSuccess && (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={20} color={palette.success} style={styles.successIcon} />
                  <Text style={styles.successText}>Verification email resent successfully!</Text>
                </View>
              )}

              {/* Error Message */}
              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={20} color={palette.error} style={styles.errorIcon} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <Button
                  title="Resend Verification Email"
                  variant="primary"
                  onPress={handleResendEmail}
                  loading={resending}
                  style={styles.button}
                  icon={<Ionicons name="mail" size={20} color={palette.accent.white} />}
                />
                <Button
                  title="Back to Sign In"
                  variant="outline"
                  onPress={handleBackToLogin}
                  style={styles.button}
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
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.base,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: palette.accent.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      },
    }),
  },
  title: {
    ...typography.h2,
    color: palette.accent.white,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: palette.accent.white,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  email: {
    ...typography.body,
    color: palette.accent.white,
    fontWeight: '600',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(233, 229, 214, 0.15)',
    borderRadius: 12,
    padding: spacing.base,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(233, 229, 214, 0.3)',
    width: '100%',
  },
  infoIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  infoText: {
    ...typography.body,
    color: palette.accent.white,
    flex: 1,
    lineHeight: 22,
  },
  successBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 12,
    padding: spacing.base,
    marginTop: spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    width: '100%',
  },
  successIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  successText: {
    ...typography.body,
    color: palette.accent.white,
    flex: 1,
    lineHeight: 22,
  },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    borderRadius: 12,
    padding: spacing.base,
    marginTop: spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
    width: '100%',
  },
  errorIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  errorText: {
    ...typography.body,
    color: palette.accent.white,
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    marginTop: spacing.xxxl,
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
});
