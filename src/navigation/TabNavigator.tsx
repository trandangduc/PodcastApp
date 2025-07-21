import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import FavoritesScreen from '../screens/Favorites/FavoritesScreen';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#aaa',
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return <Ionicons name="home-outline" size={size} color={color} />;
          } else if (route.name === 'Favorites') {
            return <Ionicons name="heart-outline" size={size} color={color} />;
          } else if (route.name === 'Profile') {
            return <MaterialIcons name="person-outline" size={size} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ tabBarLabel: 'Yêu thích' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Hồ sơ' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

// types.ts - Updated navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  
  // Profile screens
  DetailsProfileScreen: undefined;
  EditProfileScreen: undefined;
  AccountSettingsScreen: undefined;
  AccountSecurityScreen: undefined;
  ChangePasswordScreen: undefined;
  
  // Podcast screens
  PodcastList: {
    categoryId?: string;
    categoryName?: string;
  };
  PodcastDetail: {
    podcastId: string;
  };
  Favorites: undefined;
};

export type TabParamList = {
  Home: undefined;
  Favorites: undefined;
  Profile: undefined;
};