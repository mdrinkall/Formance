/**
 * Supabase client configuration
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get Supabase credentials from app config
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

// Validate credentials
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage =
    '❌ Supabase Configuration Error\n' +
    '- Missing credentials in app.config.js\n' +
    '- Ensure .env file has EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY\n' +
    '- Restart with: npx expo start --clear';

  if (__DEV__) {
    console.error(errorMessage);
    console.error('URL:', supabaseUrl || 'missing');
    console.error('Key:', supabaseAnonKey ? 'present' : 'missing');
  }
  throw new Error('Supabase credentials not configured');
}

// Success logging only in development
if (__DEV__) {
  console.log('✅ Supabase initialized');
}

// Create Supabase client with AsyncStorage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
// TODO: Generate types from Supabase schema using `supabase gen types typescript`
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      recordings: {
        Row: {
          id: string;
          user_id: string | null;
          video_url: string;
          analysis: any; // JSONB
          score: number | null;
          club_used: string | null;
          shot_shape: string | null;
          created_at: string;
          status: string;
          payment_id: string | null;
          analyzed_at: string | null;
          analysis_version: string;
        };
        Insert: Omit<Database['public']['Tables']['recordings']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['recordings']['Insert']>;
      };
      // TODO: Add other table types (community_posts, follows, messages, etc.)
    };
  };
};
