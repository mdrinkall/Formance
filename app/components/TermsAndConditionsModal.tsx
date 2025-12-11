/**
 * TermsAndConditionsModal
 * Reusable modal for displaying Terms and Conditions
 */
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';

interface TermsAndConditionsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.modalCloseButton}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={28} color={palette.text.light.primary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Terms & Conditions</Text>
          <View style={styles.modalPlaceholder} />
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentContainer}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using Formance, you accept and agree to be bound by the terms and
            provision of this agreement. If you do not agree to these terms, please do not use
            our service.
          </Text>

          <Text style={styles.sectionTitle}>2. Use of Service</Text>
          <Text style={styles.paragraph}>
            Formance provides a platform for golf swing analysis and community interaction. You
            agree to use the service only for lawful purposes and in accordance with these terms.
          </Text>

          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account and password.
            You agree to accept responsibility for all activities that occur under your account.
          </Text>

          <Text style={styles.sectionTitle}>4. Content</Text>
          <Text style={styles.paragraph}>
            You retain all rights to the content you upload to Formance. By uploading content,
            you grant us a non-exclusive, worldwide license to use, display, and distribute your
            content in connection with the service.
          </Text>

          <Text style={styles.sectionTitle}>5. Privacy</Text>
          <Text style={styles.paragraph}>
            Your use of Formance is also governed by our Privacy Policy. We collect and use
            information as described in our Privacy Policy to provide and improve our services.
          </Text>

          <Text style={styles.sectionTitle}>6. Prohibited Activities</Text>
          <Text style={styles.paragraph}>
            You may not use Formance to:
          </Text>
          <Text style={styles.bulletPoint}>• Violate any laws or regulations</Text>
          <Text style={styles.bulletPoint}>• Harass, abuse, or harm other users</Text>
          <Text style={styles.bulletPoint}>• Upload malicious code or viruses</Text>
          <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to our systems</Text>
          <Text style={styles.bulletPoint}>• Use the service for commercial purposes without permission</Text>

          <Text style={styles.sectionTitle}>7. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to terminate or suspend your account at any time, without prior
            notice or liability, for any reason, including if you breach these Terms.
          </Text>

          <Text style={styles.sectionTitle}>8. Disclaimers</Text>
          <Text style={styles.paragraph}>
            Formance is provided "as is" without warranties of any kind. We do not guarantee that
            the service will be uninterrupted, secure, or error-free.
          </Text>

          <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            To the maximum extent permitted by law, Formance shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages resulting from your use of the
            service.
          </Text>

          <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these terms at any time. We will notify you of any
            changes by posting the new terms on this page. Your continued use of the service after
            changes constitutes acceptance of the new terms.
          </Text>

          <Text style={styles.sectionTitle}>11. Contact</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us through our support
            channels.
          </Text>

          <Text style={styles.lastUpdated}>Last updated: December 2025</Text>
        </ScrollView>
      </View>
    </Modal>
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
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.h4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...typography.body,
    lineHeight: 24,
    marginBottom: spacing.base,
    color: palette.text.light.primary,
  },
  bulletPoint: {
    ...typography.body,
    lineHeight: 24,
    marginBottom: spacing.xs,
    marginLeft: spacing.base,
    color: palette.text.light.primary,
  },
  lastUpdated: {
    ...typography.caption,
    color: palette.text.light.secondary,
    marginTop: spacing.xl,
    fontStyle: 'italic',
  },
});
