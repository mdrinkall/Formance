/**
 * TabNavigator
 * Bottom tab navigation for main app screens
 * Tabs: Home, Community, Record Swing (center), History, Profile
 */

import React from 'react';
import { TouchableOpacity, Platform, Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TabBar } from '../components/layout/TabBar';
import { Header } from '../components/Header';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TermsAndConditionsModal } from '../components/TermsAndConditionsModal';
import { useAuthContext } from '../context/AuthContext';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { supabase } from '../services/supabase';
import HomeScreen from '../screens/Home/HomeScreen';
import CommunityScreen from '../screens/Community/CommunityScreen';
import CaptureScreen from '../screens/Capture/CaptureScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC = () => {
  const { user, signOut } = useAuthContext();
  const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [termsModalVisible, setTermsModalVisible] = React.useState(false);
  const [deletePassword, setDeletePassword] = React.useState('');
  const [signingOut, setSigningOut] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.fullName || 'Profile';

  const handleSettings = () => {
    setSettingsModalVisible(true);
  };

  const handleSignOut = async () => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Are you sure you want to sign out?')
      : true;

    if (!confirmed) return;

    try {
      setSigningOut(true);
      await signOut();
    } catch (error: any) {
      console.error('Error signing out:', error);
      alert('Failed to sign out');
      setSigningOut(false);
    }
  };

  const handleFAQ = () => {
    console.log('FAQ pressed');
    setSettingsModalVisible(false);
  };

  const handlePrivacy = () => {
    console.log('Privacy Policy pressed');
    setSettingsModalVisible(false);
  };

  const handleTerms = () => {
    setSettingsModalVisible(false);
    setTermsModalVisible(true);
  };

  const handleSupport = () => {
    console.log('Support pressed');
    setSettingsModalVisible(false);
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter your password to confirm account deletion');
      }
      return;
    }

    try {
      setDeleting(true);

      // Verify password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: deletePassword,
      });

      if (signInError) {
        if (Platform.OS === 'web') {
          alert('Incorrect password. Please try again.');
        }
        setDeleting(false);
        return;
      }

      // Delete all user data in order (respecting foreign key constraints)

      // 1. Delete community posts
      await supabase
        .from('community_posts')
        .delete()
        .eq('user_id', user?.id);

      // 2. Delete follows (both as follower and following)
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user?.id);

      await supabase
        .from('follows')
        .delete()
        .eq('following_id', user?.id);

      // 3. Delete messages (both sent and received)
      await supabase
        .from('messages')
        .delete()
        .eq('sender_id', user?.id);

      await supabase
        .from('messages')
        .delete()
        .eq('receiver_id', user?.id);

      // 4. Delete notifications
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user?.id);

      // 5. Delete recordings
      await supabase
        .from('recordings')
        .delete()
        .eq('user_id', user?.id);

      // 6. Finally delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);

      if (profileError) {
        throw profileError;
      }

      // 7. Delete the auth user account
      const { error: authError } = await supabase.rpc('delete_user');

      if (authError) {
        console.error('Error deleting auth user:', authError);
        // Continue anyway - profile data is already deleted
      }

      // Close modals and sign out
      setDeleteModalVisible(false);
      setSettingsModalVisible(false);
      await signOut();

      if (Platform.OS === 'web') {
        alert('Account deleted successfully. Your data has been removed.');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      if (Platform.OS === 'web') {
        alert('Failed to delete account. Please try again or contact support.');
      }
    } finally {
      setDeleting(false);
      setDeletePassword('');
    }
  };

  const SettingsButton = () => (
    <TouchableOpacity
      onPress={handleSettings}
      style={{
        paddingLeft: 16,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
          web: {
            cursor: 'pointer',
            userSelect: 'none',
          },
        }),
      }}
      accessibilityRole="button"
      accessibilityLabel="Settings"
    >
      <Ionicons name="settings-outline" size={24} color={palette.accent.white} />
    </TouchableOpacity>
  );

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            header: () => <Header showLogo backgroundColor="#1A4D2E" />,
            headerShown: true,
          }}
        />
        <Tab.Screen
          name="Community"
          component={CommunityScreen}
          options={{
            header: () => <Header title="Community" backgroundColor="#1A4D2E" />,
            headerShown: true,
          }}
        />
        <Tab.Screen
          name="Record"
          component={CaptureScreen}
          options={{
            tabBarLabel: 'Record Swing',
            // No header for Record Swing screen
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            header: () => <Header title="History" backgroundColor="#1A4D2E" />,
            headerShown: true,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            header: () => (
              <Header
                title={fullName}
                showLogo={false}
                backgroundColor="#1A4D2E"
                rightActions={<SettingsButton />}
              />
            ),
            headerShown: true,
          }}
        />
      </Tab.Navigator>

      {/* Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setSettingsModalVisible(false)}
              style={styles.modalCloseButton}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={28} color={palette.text.light.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Settings</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Button
              title="FAQ"
              variant="outline"
              style={styles.settingsButton}
              onPress={handleFAQ}
            />
            <Button
              title="Support"
              variant="outline"
              style={styles.settingsButton}
              onPress={handleSupport}
            />
            <Button
              title="Privacy Policy"
              variant="outline"
              style={styles.settingsButton}
              onPress={handlePrivacy}
            />
            <Button
              title="Terms of Service"
              variant="outline"
              style={styles.settingsButton}
              onPress={handleTerms}
            />
            <Button
              title="Sign Out"
              variant="primary"
              style={styles.signOutButton}
              onPress={handleSignOut}
              loading={signingOut}
            />
            <Button
              title="Delete Account"
              variant="outline"
              style={styles.deleteAccountButton}
              onPress={() => {
                setSettingsModalVisible(false);
                setDeleteModalVisible(true);
              }}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalHeader}>
              <Ionicons name="warning" size={48} color={palette.error} />
              <Text style={styles.deleteModalTitle}>Delete Account</Text>
              <Text style={styles.deleteModalDescription}>
                This action cannot be undone. All your data will be permanently deleted.
              </Text>
            </View>

            <Input
              label="Enter your password to confirm"
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Password"
              secureTextEntry
              autoCapitalize="none"
              style={styles.passwordInput}
            />

            <View style={styles.deleteModalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeletePassword('');
                }}
                style={styles.deleteModalButton}
              />
              <Button
                title="Delete"
                variant="primary"
                onPress={handleDeleteAccount}
                loading={deleting}
                style={[styles.deleteModalButton, styles.deleteButton]}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: palette.accent.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: Platform.OS === 'ios' ? spacing.huge : spacing.lg,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.light,
  },
  modalCloseButton: {
    padding: spacing.xs,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  modalTitle: {
    ...typography.h4,
  },
  modalPlaceholder: {
    width: 44,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: spacing.base,
  },
  settingsButton: {
    marginBottom: spacing.base,
  },
  signOutButton: {
    marginTop: spacing.lg,
  },
  deleteAccountButton: {
    marginTop: spacing.base,
    borderColor: palette.error,
  },

  // Delete Modal
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  deleteModalContent: {
    backgroundColor: palette.accent.white,
    borderRadius: 16,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }
      : Platform.OS === 'android'
      ? { elevation: 8 }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        }),
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  deleteModalTitle: {
    ...typography.h3,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  deleteModalDescription: {
    ...typography.body,
    color: palette.text.light.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  passwordInput: {
    marginBottom: spacing.lg,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  deleteModalButton: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: palette.error,
  },
});
