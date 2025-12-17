/**
 * CommunityScreen
 * Social features with swipeable tabs: Community, Friends, Leaderboards
 * Includes search functionality for finding users
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { Header } from '../../components/Header';
import { SearchModal } from '../../components/SearchModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = ['Community', 'Friends', 'Leaderboards'];

// Skeleton content component
const SkeletonContent: React.FC<{ icon: string; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <View style={styles.skeletonContainer}>
    <Ionicons name={icon as any} size={64} color={palette.primary[900]} />
    <Text style={styles.skeletonTitle}>{title}</Text>
    <Text style={styles.skeletonDescription}>{description}</Text>
  </View>
);

export default function CommunityScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState(0);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-open search if navigated with openSearch param
  useEffect(() => {
    if (route?.params?.openSearch) {
      setSearchModalVisible(true);
      // Clear the param after opening to prevent re-opening on return
      navigation.setParams({ openSearch: undefined });
    }
  }, [route?.params?.openSearch]);

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (newIndex >= 0 && newIndex < TABS.length && newIndex !== activeTab) {
      setActiveTab(newIndex);
    }
  };

  const handleUserPress = (userId: string) => {
    setSearchModalVisible(false);
    navigation.navigate('Social', {
      screen: 'UserProfile',
      params: { userId },
    });
  };

  return (
    <View style={styles.container}>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => setSearchModalVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Search for people"
        >
          <Ionicons name="search" size={20} color={palette.text.light.secondary} />
          <Text style={styles.searchBarPlaceholder}>Search for people</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Headers */}
      <View style={styles.tabHeaderContainer}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabHeader}
            onPress={() => handleTabPress(index)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={`${tab} tab`}
            accessibilityState={{ selected: activeTab === index }}
          >
            <Text
              style={[styles.tabHeaderText, activeTab === index && styles.tabHeaderTextActive]}
            >
              {tab}
            </Text>
            {activeTab === index && <View style={styles.tabHeaderIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Swipeable Content using ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        <View style={styles.page}>
          <SkeletonContent
            icon="people"
            title="Community"
            description="Community feed content will appear here"
          />
        </View>
        <View style={styles.page}>
          <SkeletonContent
            icon="person-add"
            title="Friends"
            description="Your friends' activity will appear here"
          />
        </View>
        <View style={styles.page}>
          <SkeletonContent
            icon="trophy"
            title="Leaderboards"
            description="Rankings and leaderboards will appear here"
          />
        </View>
      </ScrollView>

      {/* Search Modal */}
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onUserPress={handleUserPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.accent.white,
  },

  // Search Bar
  searchBarContainer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: palette.accent.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.neutral[100],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        cursor: 'text',
      },
    }),
  },
  searchBarPlaceholder: {
    ...typography.body,
    color: palette.text.light.secondary,
  },

  // Tab Headers
  tabHeaderContainer: {
    flexDirection: 'row',
    backgroundColor: palette.accent.white,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.light,
    paddingHorizontal: spacing.base,
  },
  tabHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    position: 'relative',
    minHeight: 48,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
  tabHeaderText: {
    ...typography.body,
    fontWeight: '500',
    color: palette.text.light.secondary,
  },
  tabHeaderTextActive: {
    color: palette.primary[900],
    fontWeight: '700',
  },
  tabHeaderIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: palette.primary[900],
    borderRadius: 2,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },

  // Skeleton Content
  skeletonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  skeletonTitle: {
    ...typography.h3,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: palette.text.light.primary,
  },
  skeletonDescription: {
    ...typography.body,
    color: palette.text.light.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
});
