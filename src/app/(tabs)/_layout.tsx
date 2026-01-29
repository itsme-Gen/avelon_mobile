import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar style="light" backgroundColor="#000" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#808080',
          tabBarStyle: {
            height: 60 + insets.bottom,
            paddingBottom: 0,
            paddingTop: 8,
            backgroundColor: '#000',
          },
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Movies',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="bankbuilding"
          options={{
            title: 'Loan Plans',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'heart' : 'heart-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: 'My Wallet',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'wallet' : 'wallet-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="document"
          options={{
            title: 'Documents',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'search' : 'search-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />

         <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'person' : 'person-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}