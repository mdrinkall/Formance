/**
 * DashboardScreen
 * Detailed stats and analytics dashboard
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { PlaceholderChart } from '../../components/charts/PlaceholderChart';
import { useAuthContext } from '../../context/AuthContext';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';

export default function DashboardScreen() {
  const { signOut, user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    // Web-compatible confirmation
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (!confirmed) return;
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              await performLogout();
            },
          },
        ],
      );
      return;
    }

    await performLogout();
  };

  const performLogout = async () => {
    try {
      setLoading(true);
      await signOut();
    } catch (error: any) {
      if (Platform.OS === 'web') {
        alert(`Error: ${error.message || 'Failed to sign out'}`);
      } else {
        Alert.alert('Error', error.message || 'Failed to sign out');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Header with Logout */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            {user?.email && (
              <Text style={styles.subtitle}>{user.email}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            disabled={loading}
          >
            <Ionicons name="log-out-outline" size={24} color={palette.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Charts */}
        <PlaceholderChart title="Score Trend" height={200} />

        <View style={styles.chartSpacing}>
          <PlaceholderChart title="Practice Time" height={200} />
        </View>

        <View style={styles.chartSpacing}>
          <PlaceholderChart title="Swing Consistency" height={200} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: palette.text.dark.primary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: palette.text.dark.secondary,
    marginTop: spacing.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  logoutText: {
    ...typography.bodySmall,
    color: palette.error,
    fontWeight: '600',
  },
  chartSpacing: {
    marginTop: spacing.base,
  },
});
