/**
 * SettingsScreen
 * App settings including subscription management
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Modal, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthContext } from '../../context/AuthContext';
import { useSubscriptionContext } from '../../context/SubscriptionContext';
import { formatSubscriptionStatus } from '../../services/subscriptionService';
import { supabase } from '../../services/supabase';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user, signOut } = useAuthContext();
  const { subscription, isActive, isExpired, daysRemaining, loading, refresh } = useSubscriptionContext();
  const [canceling, setCanceling] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const handleCancelSubscription = () => {
    if (!subscription?.stripe_subscription_id) {
      console.error('No active subscription found');
      return;
    }
    setCancelModalVisible(true);
  };

  const confirmCancelSubscription = async () => {
    try {
      setCanceling(true);

      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscription_id: subscription.stripe_subscription_id,
          cancel_at_period_end: true,
        },
      });

      if (error) {
        console.error('Cancellation error:', error);
        setCanceling(false);
        return;
      }

      console.log('Cancellation response:', data);

      // Refresh subscription data
      await refresh();
      setCancelModalVisible(false);
    } catch (error) {
      console.error('Cancel subscription error:', error);
    } finally {
      setCanceling(false);
    }
  };

  const handleReactivate = async () => {
    if (!subscription?.stripe_subscription_id) {
      console.error('No subscription found');
      return;
    }

    try {
      setCanceling(true);

      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscription_id: subscription.stripe_subscription_id,
          cancel_at_period_end: false,
        },
      });

      if (error) {
        console.error('Reactivation error:', error);
        setCanceling(false);
        return;
      }

      // Refresh subscription data
      await refresh();
    } catch (error) {
      console.error('Reactivate subscription error:', error);
    } finally {
      setCanceling(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
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
        setDeleting(false);
        return;
      }

      // Delete all user data in order (respecting foreign key constraints)
      await supabase.from('community_posts').delete().eq('user_id', user?.id);
      await supabase.from('follow_requests').delete().eq('requester_id', user?.id);
      await supabase.from('follow_requests').delete().eq('requested_id', user?.id);
      await supabase.from('follows').delete().eq('follower_id', user?.id);
      await supabase.from('follows').delete().eq('following_id', user?.id);
      await supabase.from('blocks').delete().eq('blocker_id', user?.id);
      await supabase.from('blocks').delete().eq('blocked_id', user?.id);
      await supabase.from('messages').delete().eq('sender_id', user?.id);
      await supabase.from('messages').delete().eq('receiver_id', user?.id);
      await supabase.from('notifications').delete().eq('user_id', user?.id);
      await supabase.from('recordings').delete().eq('user_id', user?.id);
      await supabase.from('payments').delete().eq('user_id', user?.id);
      await supabase.from('subscriptions').delete().eq('user_id', user?.id);

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);

      if (profileError) {
        throw profileError;
      }

      // Delete the auth user account
      const { error: authError } = await supabase.rpc('delete_user');

      if (authError) {
        console.error('Error deleting auth user:', authError);
      }

      setDeleteModalVisible(false);
      await signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleting(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      setUpdatingPayment(true);

      const returnUrl = Platform.OS === 'web'
        ? window.location.href
        : 'formance://settings';

      const { data, error } = await supabase.functions.invoke('create-billing-portal-session', {
        body: { return_url: returnUrl },
      });

      if (error) {
        console.error('Error creating billing portal session:', error);
        return;
      }

      if (data?.url) {
        if (Platform.OS === 'web') {
          window.location.href = data.url;
        } else {
          await Linking.openURL(data.url);
        }
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
    } finally {
      setUpdatingPayment(false);
    }
  };

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.id) return;

      try {
        setPaymentsLoading(true);
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching payments:', error);
        } else {
          setPayments(data || []);
        }
      } catch (error) {
        console.error('Error loading payments:', error);
      } finally {
        setPaymentsLoading(false);
      }
    };

    fetchPayments();
  }, [user?.id]);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={palette.text.light.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>

          {loading ? (
            <Card style={styles.card}>
              <ActivityIndicator size="small" color={palette.primary[700]} />
              <Text style={styles.loadingText}>Loading subscription...</Text>
            </Card>
          ) : subscription ? (
            <Card style={styles.card}>
              <View style={styles.subscriptionHeader}>
                <View>
                  <Text style={styles.subscriptionPlan}>Pro Plan</Text>
                  <View style={styles.statusBadgeContainer}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isActive
                            ? `${palette.success}15`
                            : isExpired
                            ? `${palette.error}15`
                            : `${palette.warning}15`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: isActive
                              ? palette.success
                              : isExpired
                              ? palette.error
                              : palette.warning,
                          },
                        ]}
                      >
                        {formatSubscriptionStatus(subscription.status)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons
                  name={isActive ? 'checkmark-circle' : 'alert-circle'}
                  size={32}
                  color={isActive ? palette.success : palette.warning}
                />
              </View>

              {subscription.current_period_end && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {isActive ? 'Renews on' : 'Expires on'}
                  </Text>
                  <Text style={styles.detailValue}>
                    {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              )}

              {isActive && daysRemaining !== null && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Days remaining</Text>
                  <Text style={styles.detailValue}>
                    {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              {subscription.cancel_at_period_end ? (
                <>
                  <View style={styles.cancellationWarning}>
                    <Ionicons name="alert-circle" size={20} color={palette.warning} />
                    <Text style={styles.cancellationText}>
                      Subscription will end on {subscription.cancel_at ? new Date(subscription.cancel_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'end of period'}
                    </Text>
                  </View>
                  <Button
                    title={canceling ? 'Reactivating...' : 'Reactivate Subscription'}
                    variant="primary"
                    onPress={handleReactivate}
                    disabled={canceling}
                    style={styles.reactivateButton}
                  />
                </>
              ) : isActive ? (
                <>
                  <Button
                    title={canceling ? 'Canceling...' : 'Cancel Subscription'}
                    variant="outline"
                    onPress={handleCancelSubscription}
                    disabled={canceling}
                    style={styles.cancelButton}
                  />
                  {subscription.current_period_end && (
                    <Text style={styles.cancelNote}>
                      Renews on {new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </Text>
                  )}
                </>
              ) : null}
            </Card>
          ) : (
            <Card style={styles.card}>
              <View style={styles.noSubscription}>
                <Ionicons name="diamond-outline" size={48} color={palette.primary[700]} />
                <Text style={styles.noSubscriptionTitle}>No Active Subscription</Text>
                <Text style={styles.noSubscriptionText}>
                  Subscribe to unlock unlimited swing analysis and premium features
                </Text>
                <Button
                  title="View Plans"
                  variant="primary"
                  onPress={() => navigation.navigate('Home' as never)}
                  style={styles.upgradeButton}
                />
              </View>
            </Card>
          )}

          {/* Manage Payment Method */}
          {subscription && (
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleUpdatePaymentMethod}
              disabled={updatingPayment}
              accessibilityRole="button"
              accessibilityLabel="Manage payment method"
            >
              <View style={styles.settingLeft}>
                <Ionicons name="card-outline" size={24} color={palette.text.light.primary} />
                <Text style={styles.settingLabel}>
                  {updatingPayment ? 'Opening...' : 'Manage Payment Method'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={palette.text.light.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Billing History Section */}
        {subscription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing History</Text>

            {paymentsLoading ? (
              <Card style={styles.card}>
                <ActivityIndicator size="small" color={palette.primary[700]} />
                <Text style={styles.loadingText}>Loading invoices...</Text>
              </Card>
            ) : payments.length > 0 ? (
              <Card style={styles.card}>
                {payments.map((payment, index) => (
                  <View key={payment.id}>
                    <View style={styles.invoiceRow}>
                      <View style={styles.invoiceInfo}>
                        <View style={styles.invoiceHeader}>
                          <Ionicons
                            name={payment.status === 'paid' ? 'checkmark-circle' : 'alert-circle'}
                            size={20}
                            color={payment.status === 'paid' ? palette.success : palette.error}
                          />
                          <Text style={styles.invoiceDate}>
                            {new Date(payment.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Text>
                        </View>
                        <Text style={styles.invoiceAmount}>
                          £{(payment.amount_paid / 100).toFixed(2)}
                        </Text>
                        <Text style={styles.invoiceStatus}>
                          {payment.status === 'paid' ? 'Paid' : payment.status}
                        </Text>
                      </View>
                      {payment.invoice_pdf && (
                        <TouchableOpacity
                          style={styles.downloadButton}
                          onPress={() => Linking.openURL(payment.invoice_pdf)}
                          accessibilityRole="button"
                          accessibilityLabel="Download invoice"
                        >
                          <Ionicons name="download-outline" size={20} color={palette.primary[700]} />
                        </TouchableOpacity>
                      )}
                    </View>
                    {index < payments.length - 1 && <View style={styles.invoiceDivider} />}
                  </View>
                ))}
              </Card>
            ) : (
              <Card style={styles.card}>
                <Text style={styles.noInvoicesText}>No billing history yet</Text>
              </Card>
            )}
          </View>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => console.log('Privacy settings')}
            accessibilityRole="button"
          >
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed-outline" size={24} color={palette.text.light.primary} />
              <Text style={styles.settingLabel}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.text.light.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => console.log('Notifications settings')}
            accessibilityRole="button"
          >
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color={palette.text.light.primary} />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.text.light.secondary} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => console.log('Help & FAQ')}
            accessibilityRole="button"
          >
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle-outline" size={24} color={palette.text.light.primary} />
              <Text style={styles.settingLabel}>Help & FAQ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.text.light.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => console.log('Contact Support')}
            accessibilityRole="button"
          >
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={24} color={palette.text.light.primary} />
              <Text style={styles.settingLabel}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.text.light.secondary} />
          </TouchableOpacity>
        </View>

        {/* Account Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Management</Text>

          <Button
            title={signingOut ? 'Signing Out...' : 'Sign Out'}
            variant="outline"
            onPress={handleSignOut}
            disabled={signingOut}
            style={styles.signOutButton}
          />

          <Button
            title="Delete Account"
            variant="outline"
            onPress={() => setDeleteModalVisible(true)}
            style={styles.deleteButton}
          />
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setDeleteModalVisible(false)}
              style={styles.modalCloseButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={28} color={palette.text.light.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={48} color={palette.error} />
              <Text style={styles.warningTitle}>This action cannot be undone</Text>
              <Text style={styles.warningText}>
                Deleting your account will permanently remove all your data including:
              </Text>
              <View style={styles.warningList}>
                <Text style={styles.warningListItem}>• Profile and account information</Text>
                <Text style={styles.warningListItem}>• All swing recordings and analyses</Text>
                <Text style={styles.warningListItem}>• Messages and community posts</Text>
                <Text style={styles.warningListItem}>• Followers and following connections</Text>
                <Text style={styles.warningListItem}>• Payment history and subscriptions</Text>
              </View>
            </View>

            <Input
              label="Enter your password to confirm"
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Password"
              secureTextEntry
              autoCapitalize="none"
            />

            <Button
              title={deleting ? 'Deleting Account...' : 'Delete My Account'}
              variant="primary"
              onPress={handleDeleteAccount}
              disabled={deleting || !deletePassword.trim()}
              style={[styles.deleteConfirmButton, { backgroundColor: palette.error }]}
            />

            <Button
              title="Cancel"
              variant="outline"
              onPress={() => {
                setDeleteModalVisible(false);
                setDeletePassword('');
              }}
              disabled={deleting}
              style={styles.cancelButton}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Cancel Subscription Confirmation Modal */}
      <Modal
        visible={cancelModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalHeader}>
              <Ionicons name="alert-circle" size={48} color={palette.warning} />
              <Text style={styles.deleteModalTitle}>Cancel Subscription</Text>
              <Text style={styles.deleteModalDescription}>
                Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period.
              </Text>
            </View>

            <View style={styles.deleteModalActions}>
              <Button
                title="Keep Subscription"
                variant="outline"
                onPress={() => setCancelModalVisible(false)}
                disabled={canceling}
                style={styles.deleteModalButton}
              />
              <Button
                title={canceling ? 'Canceling...' : 'Cancel Subscription'}
                variant="primary"
                onPress={confirmCancelSubscription}
                loading={canceling}
                style={[styles.deleteModalButton, styles.deleteButton]}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.background.light,
    ...Platform.select({
      web: {
        height: '100vh',
        maxHeight: '100vh',
      },
    }),
  },
  container: {
    flex: 1,
    flexShrink: 1,
    ...Platform.select({
      web: {
        overflow: 'auto',
      },
    }),
  },
  contentContainer: {
    paddingBottom: spacing.massive + spacing.xl, // Extra padding for small devices
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  headerTitle: {
    ...typography.h4,
    color: palette.text.light.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.base,
  },
  sectionTitle: {
    ...typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: palette.text.light.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.base,
  },
  loadingText: {
    ...typography.body,
    color: palette.text.light.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  subscriptionPlan: {
    ...typography.h4,
    color: palette.text.light.primary,
    marginBottom: spacing.xs,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    ...typography.body,
    color: palette.text.light.secondary,
  },
  detailValue: {
    ...typography.label,
    fontWeight: '400',
    color: palette.text.light.primary,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border.light,
    marginVertical: spacing.md,
  },
  cancelButton: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
  cancelNote: {
    ...typography.caption,
    color: palette.text.light.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  cancellationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${palette.warning}15`,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancellationText: {
    ...typography.body,
    fontSize: 13,
    color: palette.text.light.primary,
    flex: 1,
  },
  reactivateButton: {
    marginTop: spacing.md,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  invoiceDate: {
    ...typography.label,
    fontSize: 14,
    fontWeight: '500',
    color: palette.text.light.primary,
  },
  invoiceAmount: {
    ...typography.h4,
    fontSize: 18,
    color: palette.text.light.primary,
    marginBottom: spacing.xs - 2,
  },
  invoiceStatus: {
    ...typography.caption,
    fontSize: 12,
    color: palette.text.light.secondary,
    textTransform: 'capitalize',
  },
  downloadButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: `${palette.primary[700]}10`,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: palette.border.light,
    marginVertical: spacing.sm,
  },
  noInvoicesText: {
    ...typography.body,
    color: palette.text.light.secondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  noSubscription: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  noSubscriptionTitle: {
    ...typography.h4,
    color: palette.text.light.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  noSubscriptionText: {
    ...typography.body,
    color: palette.text.light.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  upgradeButton: {
    minWidth: 200,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.accent.white,
    borderRadius: 12,
    marginBottom: spacing.sm,
    minHeight: 56,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    fontWeight: '500',
    color: palette.text.light.primary,
  },
  signOutButton: {
    marginBottom: spacing.sm,
  },
  deleteButton: {
    borderColor: palette.error,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: palette.background.light,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.light,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  modalTitle: {
    ...typography.h3,
    color: palette.text.light.primary,
  },
  modalPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: spacing.base,
    paddingBottom: spacing.massive,
  },
  warningBox: {
    backgroundColor: `${palette.error}10`,
    borderWidth: 2,
    borderColor: palette.error,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  warningTitle: {
    ...typography.h4,
    color: palette.error,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  warningText: {
    ...typography.body,
    color: palette.text.light.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  warningList: {
    alignSelf: 'stretch',
  },
  warningListItem: {
    ...typography.body,
    color: palette.text.light.primary,
    marginBottom: spacing.xs,
  },
  deleteConfirmButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  // Modal styles
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
    ...Platform.select({
      web: {
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      },
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
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
  deleteModalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  deleteModalButton: {
    flex: 1,
  },
});
