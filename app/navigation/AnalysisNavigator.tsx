/**
 * AnalysisNavigator
 * Navigation for swing analysis flow
 */

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import VideoUploadScreen from '../screens/Analysis/VideoUploadScreen';
import ClubSelectionScreen from '../screens/Analysis/ClubSelectionScreen';
import ShotShapeSelectionScreen from '../screens/Analysis/ShotShapeSelectionScreen';
import PaywallScreen from '../screens/Analysis/PaywallScreen';
import AnalysisLoadingScreen from '../screens/Analysis/AnalysisLoadingScreen';
import ResultsScreen from '../screens/Analysis/ResultsScreen';
import { AnalysisStackParamList } from '../types/analysis';
import { palette } from '../theme/palette';
import { typography } from '../styles';

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
        options={{ headerTitle: '' }}
      />
      <Stack.Screen
        name="ClubSelection"
        component={ClubSelectionScreen}
        options={{ headerTitle: '' }}
      />
      <Stack.Screen
        name="ShotShapeSelection"
        component={ShotShapeSelectionScreen}
        options={{ headerTitle: '' }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ headerTitle: '' }}
      />
      <Stack.Screen
        name="Loading"
        component={AnalysisLoadingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={({ navigation }) => ({
          headerTitle: '',
          headerLeft: () => (
            <Text style={{
              ...typography.h4,
              color: palette.accent.white,
              letterSpacing: 1.5,
              fontWeight: '400',
              marginLeft: 16,
            }}>
              FORMANCE
            </Text>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                // Navigate back to the main app tabs (Home screen)
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate('Tabs' as never);
                }
              }}
              style={{
                marginRight: 16,
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityRole="button"
              accessibilityLabel="Home"
            >
              <Ionicons name="home-outline" size={24} color={palette.accent.white} />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
};
