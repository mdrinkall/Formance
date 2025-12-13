/**
 * AnalysisNavigator
 * Navigation for swing analysis flow
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import VideoUploadScreen from '../screens/Analysis/VideoUploadScreen';
import ClubSelectionScreen from '../screens/Analysis/ClubSelectionScreen';
import ShotShapeSelectionScreen from '../screens/Analysis/ShotShapeSelectionScreen';
import PaywallScreen from '../screens/Analysis/PaywallScreen';
import AnalysisLoadingScreen from '../screens/Analysis/AnalysisLoadingScreen';
import ResultsScreen from '../screens/Analysis/ResultsScreen';
import { AnalysisStackParamList } from '../types/analysis';
import { palette } from '../theme/palette';

const Stack = createStackNavigator<AnalysisStackParamList>();

export const AnalysisNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: palette.primary[900],
          borderBottomWidth: 0,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: palette.accent.white,
        headerTitleStyle: {
          fontWeight: '400',
        },
      }}
    >
      <Stack.Screen
        name="VideoUpload"
        component={VideoUploadScreen}
        options={{ title: 'Upload Video' }}
      />
      <Stack.Screen
        name="ClubSelection"
        component={ClubSelectionScreen}
        options={{ title: 'Select Club' }}
      />
      <Stack.Screen
        name="ShotShapeSelection"
        component={ShotShapeSelectionScreen}
        options={{ title: 'Shot Shape' }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ title: 'Unlock Analysis' }}
      />
      <Stack.Screen
        name="Loading"
        component={AnalysisLoadingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: 'Analysis Results' }}
      />
    </Stack.Navigator>
  );
};
