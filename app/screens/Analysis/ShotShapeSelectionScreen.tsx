/**
 * ShotShapeSelectionScreen
 * Select desired shot shape
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { AnalysisStackParamList, ShotShapeType } from '../../types/analysis';
import { spacing, typography } from '../../styles';
import { palette } from '../../theme/palette';

type Props = StackScreenProps<AnalysisStackParamList, 'ShotShapeSelection'>;

const SHOT_SHAPES: ShotShapeType[] = [
  "I don't know",
  'Anything',
  'Straight',
  'Fade',
  'Draw',
];

export default function ShotShapeSelectionScreen({ route, navigation }: Props) {
  const { videoUrl, selectedClub } = route.params;

  const handleSelectShape = (shape: ShotShapeType) => {
    navigation.navigate('Paywall', { videoUrl, selectedClub, shotShape: shape });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>What shot shape are you trying to hit?</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
          {SHOT_SHAPES.map((shape) => (
            <SelectionCard
              key={shape}
              label={shape}
              selected={false}
              onPress={() => handleSelectShape(shape)}
              labelStyle={styles.shapeLabel}
            />
          ))}
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.primary[900],
    ...Platform.select({
      web: {
        height: '100vh',
        maxHeight: '100vh',
      },
    }),
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    flexShrink: 0,
  },
  title: {
    ...typography.h3,
    fontWeight: '400',
    color: palette.accent.white,
    textAlign: 'center',
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.massive,
    flexGrow: 1,
  },
  shapeLabel: {
    fontWeight: '400',
  },
});
