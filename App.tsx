import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from './src/navigation';
// Import các screens
import LoginScreen from './src/screens/Auth/LoginScreen';
import HomeScreen from './src/screens/Home/HomeScreen';
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#4CAF50',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: '', // Ẩn back title cho iOS
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
      {/*   <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{
            headerShown: false,
          }}
        />*/}
        
        {/* Main App Screens */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Trang chủ',
            headerLeft: () => null, // Ẩn nút back
          }}
        />
      
      </Stack.Navigator>
    </NavigationContainer>
  );
}