import { Stack } from "expo-router";
import * as NativeSplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { LogBox } from "react-native";
import * as Notifications from "expo-notifications";
import { setupAndroidChannel } from "@/services/notification.service";
import "../styles/global.css";

// Keep native splash visible until we manually hide it
NativeSplashScreen.preventAutoHideAsync();

// Suppress deprecation warning from dependencies
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

export default function RootLayout() {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Set up Android notification channel
    setupAndroidChannel();

    // Listener: notification received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Notification received]', notification.request.content.title);
    });

    // Listener: user taps on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log('[Notification tapped]', data);
      // TODO: navigate based on data.type (e.g. loan update, repayment reminder)
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="loan-application" />
    </Stack>
  );
}
