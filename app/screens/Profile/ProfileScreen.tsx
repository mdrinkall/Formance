/**
 * ProfileScreen
 * User profile and settings
 */

import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, Platform } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthContext } from '../../context/AuthContext';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';

export default function ProfileScreen() {
  const { signOut, user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    // Web-compatible confirmation
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (!confirmed) return;
    } else {
      // Native platforms use Alert
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
              await performSignOut();
            },
          },
        ],
      );
      return;
    }

    // Web continues here after confirmation
    await performSignOut();
  };

  const performSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
    } catch (error: any) {
      if (Platform.OS === 'web') {
        alert(`Error: ${error.message || 'Failed to sign out'}`);
      } else {
        Alert.alert('Error', error.message || 'Failed to sign out');
      }
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar} />
          <Text style={styles.userName}>{user?.email || 'User Name'}</Text>
          <Text style={styles.handicap}>Handicap: 15.2</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Stats</Text>
          <Text style={styles.cardContent}>TODO: Display user stats</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Recent Rounds</Text>
          <Text style={styles.cardContent}>TODO: Display recent rounds</Text>
        </Card>

        <Button title="Edit Profile" variant="outline" style={styles.button} />
        <Button title="Settings" variant="outline" style={styles.button} />
        <Button
          title="Sign Out"
          variant="outline"
          style={styles.button}
          onPress={handleSignOut}
          loading={loading}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    backgroundColor: palette.primary[200],
    borderRadius: 48,
    marginBottom: spacing.base,
  },
  userName: {
    ...typography.h3,
    color: palette.text.dark.primary,
  },
  handicap: {
    ...typography.body,
    color: palette.text.dark.secondary,
  },
  card: {
    marginBottom: spacing.base,
  },
  cardTitle: {
    ...typography.h4,
    marginBottom: spacing.sm,
  },
  cardContent: {
    ...typography.body,
    color: palette.text.dark.secondary,
  },
  button: {
    marginTop: spacing.sm,
  },
});
