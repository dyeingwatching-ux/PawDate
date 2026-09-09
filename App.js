import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';
import AddEditPetScreen from './screens/AddEditPetScreen';
import SettingsScreen from './screens/SettingsScreen';
import storageService from './services/storageService';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved theme preference on launch
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const settings = await storageService.getUserSettings();
        if (typeof settings.isDarkMode === 'boolean') {
          setIsDarkMode(settings.isDarkMode);
        }
      } catch (e) {
        console.warn('Failed to load theme preference:', e);
      }
    };
    loadTheme();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: isDarkMode ? '#0f172a' : '#2563eb' },
            headerTintColor: '#ffffff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerShadowVisible: false,
          }}
        >
          {/* Home Screen */}
          <Stack.Screen
            name="Home"
            options={{ title: 'PawDate', headerShown: false }}
          >
            {(props) => <HomeScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>

          {/* Pet Profile Details */}
          <Stack.Screen
            name="Detail"
            options={({ route }) => ({
              title: route.params?.pet?.name ? `${route.params.pet.name}'s Profile` : 'Pet Profile',
              headerBackTitle: 'Back',
            })}
          >
            {(props) => <DetailScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>

          {/* Add / Edit Pet Screen (CRUD POST & PUT) */}
          <Stack.Screen
            name="AddEditPet"
            options={({ route }) => ({
              title: route.params?.pet ? 'Edit Pet Profile' : 'Register New Pet',
              headerBackTitle: 'Cancel',
            })}
          >
            {(props) => <AddEditPetScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>

          {/* Settings & Configuration */}
          <Stack.Screen
            name="Settings"
            options={{ title: 'Settings & API Config', headerBackTitle: 'Back' }}
          >
            {(props) => (
              <SettingsScreen
                {...props}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}