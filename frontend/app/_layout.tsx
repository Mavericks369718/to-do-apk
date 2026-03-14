// TaskFlow Root Layout with Tab Navigator
import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DataProvider } from '../src/context/DataContext';
import { COLORS, FONTS } from '../src/constants/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DataProvider>
          <StatusBar style="dark" />
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: styles.tabBar,
              tabBarActiveTintColor: COLORS.primary,
              tabBarInactiveTintColor: COLORS.textMuted,
              tabBarLabelStyle: styles.tabLabel,
              tabBarItemStyle: styles.tabItem,
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: 'To-do',
                tabBarIcon: ({ color, size, focused }) => (
                  <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
                    <Ionicons name={focused ? 'checkbox' : 'checkbox-outline'} size={22} color={color} />
                  </View>
                ),
              }}
            />
            <Tabs.Screen
              name="today"
              options={{
                title: 'Today',
                tabBarIcon: ({ color, size, focused }) => (
                  <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
                    <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color} />
                  </View>
                ),
              }}
            />
            <Tabs.Screen
              name="notes"
              options={{
                title: 'Notes',
                tabBarIcon: ({ color, size, focused }) => (
                  <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
                    <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={22} color={color} />
                  </View>
                ),
              }}
            />
            <Tabs.Screen
              name="me"
              options={{
                title: 'Me',
                tabBarIcon: ({ color, size, focused }) => (
                  <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
                    <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
                  </View>
                ),
              }}
            />
            <Tabs.Screen
              name="task-editor"
              options={{
                href: null,
              }}
            />
            <Tabs.Screen
              name="note-editor"
              options={{
                href: null,
              }}
            />
          </Tabs>
        </DataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 0,
    paddingTop: 10,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
  },
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginTop: 4,
  },
  tabItem: {
    paddingTop: 4,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tabIconActive: {
    backgroundColor: 'rgba(124, 105, 239, 0.1)',
  },
});
