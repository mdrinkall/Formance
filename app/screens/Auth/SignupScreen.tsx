/**
 * SignupScreen
 * New user registration
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Dimensions, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { AuthFormWrapper, EmailInput, PasswordInput, SubmitButton, FormError, FormSuccess } from '../../components/auth';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const { width, height } = Dimensions.get('window');

export default function SignupScreen({ navigation }: SignupScreenProps) {
  const { signUp } = useAuthContext();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;
    setFullNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!fullName.trim()) {
      setFullNameError('Full name is required');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await signUp(email.trim(), password, fullName.trim());
      setSuccess('Account created! Please check your email to verify your account.');

      // Clear form
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
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
              <Text style={styles.headerTitle}>Register</Text>
              <View style={styles.headerRight} />
            </View>

            <AuthFormWrapper
              title="Create Account"
              subtitle="Join Formance and start tracking your game"
            >
            {error && <FormError message={error} style={styles.formMessage} />}
            {success && <FormSuccess message={success} style={styles.formMessage} />}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputWrapper, fullNameError && styles.inputWrapperError]}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={fullNameError ? palette.error : palette.primary[900]}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={palette.text.dark.disabled}
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setFullNameError('');
                  }}
                  editable={!loading}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {fullNameError && <Text style={styles.errorText}>{fullNameError}</Text>}
            </View>

            <EmailInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              error={emailError}
              editable={!loading}
            />

            <PasswordInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              error={passwordError}
              editable={!loading}
              placeholder="Create a password (min. 6 characters)"
            />

            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError('');
              }}
              error={confirmPasswordError}
              editable={!loading}
              placeholder="Re-enter your password"
            />

            <SubmitButton
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              style={styles.submitButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
  inputContainer: {
    marginBottom: spacing.base,
  },
  label: {
    ...typography.label,
    color: palette.text.dark.primary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border.light,
    borderRadius: 9999,
    backgroundColor: palette.background.light,
    paddingHorizontal: spacing.base,
    height: 52,
  },
  inputWrapperError: {
    borderColor: palette.error,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    ...typography.body,
    color: '#000000',
    flex: 1,
    height: '100%',
    outlineStyle: 'none',
  },
  errorText: {
    ...typography.caption,
    color: palette.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.lg,
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
});
