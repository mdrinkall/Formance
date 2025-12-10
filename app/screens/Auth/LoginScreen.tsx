/**
 * LoginScreen
 * User login with email/password
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '../../context/AuthContext';
import { AuthFormWrapper, EmailInput, PasswordInput, SubmitButton, FormError } from '../../components/auth';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { signIn } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

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

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      await signIn(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
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
          <AuthFormWrapper
            title="Welcome Back"
            subtitle="Sign in to continue to Formance"
          >
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

            <PasswordInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              error={passwordError}
              editable={!loading}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <SubmitButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.submitButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                disabled={loading}
              >
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </AuthFormWrapper>
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
  formMessage: {
    marginBottom: spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: palette.accent.white,
    opacity: 0.9,
  },
  submitButton: {
    marginTop: spacing.base,
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
