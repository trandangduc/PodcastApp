import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import { RootStackParamList } from './types';
import { useAuth } from '../contexts/AuthContext';

// IMPORT màn hình chi tiết hồ sơ
import DetailsProfileScreen from '../screens/Profile/DetailsProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import AccountSettingsScreen from '../screens/Profile/AccountSettingsScreen';
import AccountSecurityScreen from '../screens/Profile/AccountSecurityScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';

// IMPORT màn hình podcast mới
import PodcastListScreen from '../screens/Podcast/PodcastListScreen';
import PodcastDetailScreen from '../screens/Podcast/PodcastDetailScreen';
import FavoritesScreen from '../screens/Favorites/FavoritesScreen';
import AudioPlayerScreen from '../screens/Podcast/AudioPlayerScreen';
import HistoryScreen from '../screens/Podcast/HistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  // SỬ DỤNG AuthContext thay vì state riêng
  const { isAuthenticated, isLoading } = useAuth();

  // Hiển thị loading khi đang check auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          
          {/* Profile Screens */}
          <Stack.Screen name="DetailsProfileScreen" component={DetailsProfileScreen} />
          <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
          <Stack.Screen name="AccountSettingsScreen" component={AccountSettingsScreen} />
          <Stack.Screen name="AccountSecurityScreen" component={AccountSecurityScreen} />
          <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
          
          {/* Podcast Screens */}
          <Stack.Screen name="PodcastList" component={PodcastListScreen} />
          <Stack.Screen name="PodcastDetail" component={PodcastDetailScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="AudioPlayerScreen" component={AudioPlayerScreen} />
          <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;