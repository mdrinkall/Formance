/**
 * ScoreNavigator
 * Navigation for scorecard and score entry
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ScoreSetupScreen from '../screens/Scorecard/ScoreSetupScreen';
import ScoreEntryScreen from '../screens/Scorecard/ScoreEntryScreen';
import ScoreSummaryScreen from '../screens/Scorecard/ScoreSummaryScreen';

const Stack = createStackNavigator();

export const ScoreNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ScoreSetup" component={ScoreSetupScreen} options={{ title: 'New Round' }} />
      <Stack.Screen name="ScoreEntry" component={ScoreEntryScreen} options={{ title: 'Score Entry' }} />
      <Stack.Screen name="ScoreSummary" component={ScoreSummaryScreen} options={{ title: 'Summary' }} />
    </Stack.Navigator>
  );
};
