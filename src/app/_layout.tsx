import { Stack } from "expo-router";
import * as NativeSplashScreen from "expo-splash-screen";
import { LogBox } from "react-native";
import "../styles/global.css";

// Keep native splash visible until we manually hide it
NativeSplashScreen.preventAutoHideAsync();

// Suppress deprecation warning from dependencies
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="loan-application" />
    </Stack>
  );
}
