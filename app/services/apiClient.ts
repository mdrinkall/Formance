/**
 * API client
 * Axios instance configuration for external API calls
 * TODO: Configure with actual API base URL
 */

import axios from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // TODO: Add authentication token to requests
    // const { data: { session } } = await supabase.auth.getSession();
    // if (session?.access_token) {
    //   config.headers.Authorization = `Bearer ${session.access_token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // TODO: Handle common errors (401, 403, 500, etc.)
    // Handle token refresh if needed
    if (error.response?.status === 401) {
      // Handle unauthorized - maybe refresh token or logout
    }
    return Promise.reject(error);
  }
);

export default apiClient;
