/**
 * SocialNavigator
 * Navigation for social features (friends, groups, etc.)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FriendsListScreen from '../screens/Social/FriendsListScreen';
import FriendProfileScreen from '../screens/Social/FriendProfileScreen';
import AddFriendsScreen from '../screens/Social/AddFriendsScreen';
import GroupRoundsScreen from '../screens/Social/GroupRoundsScreen';

const Stack = createStackNavigator();

export const SocialNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FriendsList" component={FriendsListScreen} options={{ title: 'Friends' }} />
      <Stack.Screen name="FriendProfile" component={FriendProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="AddFriends" component={AddFriendsScreen} options={{ title: 'Add Friends' }} />
      <Stack.Screen name="GroupRounds" component={GroupRoundsScreen} options={{ title: 'Group Rounds' }} />
    </Stack.Navigator>
  );
};
