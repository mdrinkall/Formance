/**
 * ForgotPasswordScreen
 * Password reset flow with Supabase
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { AuthFormWrapper, EmailInput, SubmitButton, FormError } from '../../components/auth';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const { resetPassword } = useAuthContext();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    let isValid = true;
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      await resetPassword(email.trim());
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* Header with back button and title */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color={palette.accent.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Reset Password</Text>
              <View style={styles.headerRight} />
            </View>

            <AuthFormWrapper
              title="Forgot Password?"
              subtitle="Enter your email and we'll send you instructions to reset your password"
            >
              {success && (
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle" size={48} color={palette.primary[500]} style={styles.successIcon} />
                  <Text style={styles.successTitle}>Check your email</Text>
                  <Text style={styles.successMessage}>
                    We've sent password reset instructions to your email address.
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    style={styles.backToLoginButton}
                  >
                    <Text style={styles.backToLoginText}>Back to Login</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!success && (
                <>
                  {error && <FormError message={error} style={styles.formMessage} />}

                  <EmailInput
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError('');
                    }}
                    error={emailError}
                    editable={!loading}
                  />

                  <SubmitButton
                    title="Send Reset Link"
                    onPress={handleResetPassword}
                    loading={loading}
                    style={styles.submitButton}
                  />

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>Remember your password? </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Login')}
                      disabled={loading}
                    >
                      <Text style={styles.footerLink}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </AuthFormWrapper>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...typography.h4,
    color: palette.accent.white,
    fontWeight: '400',
  },
  headerRight: {
    width: 40,
  },
  formMessage: {
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: palette.accent.white,
    opacity: 0.8,
  },
  footerLink: {
    ...typography.body,
    fontWeight: '600',
    color: palette.accent.white,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.base,
  },
  successTitle: {
    ...typography.h3,
    color: palette.accent.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successMessage: {
    ...typography.body,
    color: palette.accent.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.base,
  },
  backToLoginButton: {
    marginTop: spacing.base,
    paddingVertical: spacing.sm,
  },
  backToLoginText: {
    ...typography.button,
    color: palette.primary[500],
  },
});
