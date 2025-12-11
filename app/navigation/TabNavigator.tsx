/**
 * TabNavigator
 * Bottom tab navigation for main app screens
 * Tabs: Home, Community, Record Swing (center), History, Profile
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBar } from '../components/layout/TabBar';
import { Header } from '../components/Header';
import HomeScreen from '../screens/Home/HomeScreen';
import CommunityScreen from '../screens/Community/CommunityScreen';
import CaptureScreen from '../screens/Capture/CaptureScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC = () => {
  return (
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
          header: () => <Header title="Community" />,
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
          header: () => <Header title="History" />,
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          header: () => <Header title="Profile" />,
          headerShown: true,
        }}
      />
    </Tab.Navigator>
  );
};
