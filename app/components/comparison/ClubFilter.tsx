/**
 * ClubFilter - Dropdown filter for club selection
 * Dynamically generates options with counts
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';

export interface ClubOption {
  club: string;
  count: number;
}

interface ClubFilterProps {
  clubs: ClubOption[];
  selectedClub: string | null;
  onSelectClub: (club: string | null) => void;
}

export const ClubFilter: React.FC<ClubFilterProps> = ({
  clubs,
  selectedClub,
  onSelectClub,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Sort clubs by count descending
  const sortedClubs = [...clubs].sort((a, b) => b.count - a.count);

  const handleSelect = (club: string | null) => {
    onSelectClub(club);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!selectedClub) return 'All Clubs';
    const clubOption = clubs.find(c => c.club === selectedClub);
    return clubOption ? `${clubOption.club} (${clubOption.count})` : selectedClub;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Filter by Club:</Text>

      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Filter by club"
      >
        <Text style={styles.dropdownText}>{getDisplayText()}</Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={palette.primary[700]}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Club</Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close filter"
              >
                <Ionicons name="close" size={24} color={palette.text.light.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList}>
              {/* All Clubs option */}
              <TouchableOpacity
                style={[
                  styles.option,
                  selectedClub === null && styles.selectedOption,
                ]}
                onPress={() => handleSelect(null)}
                accessibilityRole="button"
                accessibilityLabel="Show all clubs"
              >
                <Text style={[
                  styles.optionText,
                  selectedClub === null && styles.selectedOptionText,
                ]}>
                  All Clubs
                </Text>
                {selectedClub === null && (
                  <Ionicons name="checkmark" size={20} color={palette.primary[700]} />
                )}
              </TouchableOpacity>

              {/* Individual club options */}
              {sortedClubs.map((clubOption) => (
                <TouchableOpacity
                  key={clubOption.club}
                  style={[
                    styles.option,
                    selectedClub === clubOption.club && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(clubOption.club)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${clubOption.club}`}
                >
                  <Text style={[
                    styles.optionText,
                    selectedClub === clubOption.club && styles.selectedOptionText,
                  ]}>
                    {clubOption.club} ({clubOption.count})
                  </Text>
                  {selectedClub === clubOption.club && (
                    <Ionicons name="checkmark" size={20} color={palette.primary[700]} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    ...typography.label,
    color: palette.text.light.secondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: palette.background.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.primary[200],
    minHeight: 44,
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  dropdownText: {
    ...typography.body,
    color: palette.text.light.primary,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: palette.background.light,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.3)' },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: palette.primary[100],
  },
  modalTitle: {
    ...typography.h4,
    color: palette.text.light.primary,
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: palette.primary[50],
    minHeight: 44,
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  selectedOption: {
    backgroundColor: palette.primary[50],
  },
  optionText: {
    ...typography.body,
    color: palette.text.light.primary,
  },
  selectedOptionText: {
    color: palette.primary[700],
    fontWeight: '600',
  },
});
