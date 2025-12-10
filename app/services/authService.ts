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
  // TODO: Implement Supabase sign up
  // const { data: authData, error } = await supabase.auth.signUp({
  //   email: data.email,
  //   password: data.password,
  //   options: {
  //     data: {
  //       full_name: data.fullName,
  //     },
  //   },
  // });
  throw new Error('Not implemented');
};

/**
 * Sign in an existing user
 * @param data - Sign in data
 */
export const signIn = async (data: SignInData) => {
  // TODO: Implement Supabase sign in
  // const { data: authData, error } = await supabase.auth.signInWithPassword({
  //   email: data.email,
  //   password: data.password,
  // });
  throw new Error('Not implemented');
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  // TODO: Implement Supabase sign out
  // const { error } = await supabase.auth.signOut();
  throw new Error('Not implemented');
};

/**
 * Get the current user session
 */
export const getSession = async () => {
  // TODO: Implement get session
  // const { data: { session }, error } = await supabase.auth.getSession();
  throw new Error('Not implemented');
};

/**
 * Get the current user
 */
export const getCurrentUser = async () => {
  // TODO: Implement get current user
  // const { data: { user }, error } = await supabase.auth.getUser();
  throw new Error('Not implemented');
};

/**
 * Send password reset email
 * @param email - User email
 */
export const resetPassword = async (email: string) => {
  // TODO: Implement password reset
  // const { error } = await supabase.auth.resetPasswordForEmail(email);
  throw new Error('Not implemented');
};

/**
 * Update user password
 * @param newPassword - New password
 */
export const updatePassword = async (newPassword: string) => {
  // TODO: Implement password update
  // const { error } = await supabase.auth.updateUser({ password: newPassword });
  throw new Error('Not implemented');
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
  // TODO: Implement OAuth sign in
  // const { data, error } = await supabase.auth.signInWithOAuth({ provider });
  throw new Error('Not implemented');
};
