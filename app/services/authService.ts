/**
 * Authentication service
 * Handles all Supabase auth operations
 * TODO: Implement actual Supabase auth calls
 */

import { supabase } from './supabase';

export type SignUpData = {
  email: string;
  password: string;
  fullName?: string;
};

export type SignInData = {
  email: string;
  password: string;
};

/**
 * Sign up a new user
 * @param data - Sign up data
 */
export const signUp = async (data: SignUpData) => {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
      },
    },
  });

  if (error) throw error;
  return authData;
};

/**
 * Sign in an existing user
 * @param data - Sign in data
 */
export const signIn = async (data: SignInData) => {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) throw error;
  return authData;
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get the current user session
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

/**
 * Get the current user
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

/**
 * Send password reset email
 * @param email - User email
 */
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

/**
 * Update user password
 * @param newPassword - New password
 */
export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};

/**
 * Verify email with token
 * @param token - Verification token
 */
export const verifyEmail = async (token: string) => {
  // TODO: Implement email verification
  throw new Error('Not implemented');
};

/**
 * Sign in with OAuth provider
 * @param provider - OAuth provider (google, apple, etc.)
 */
export const signInWithOAuth = async (provider: 'google' | 'apple' | 'facebook') => {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider });
  if (error) throw error;
  return data;
};
