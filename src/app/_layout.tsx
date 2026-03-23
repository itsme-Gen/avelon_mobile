import "react-native-get-random-values"; // Must be first — crypto polyfill for WalletConnect
import { Stack } from "expo-router";
import * as NativeSplashScreen from "expo-splash-screen";
import { cloneElement, useEffect, useRef } from "react";
import { LogBox, StyleSheet, Text, TextInput } from "react-native";
import * as Notifications from "expo-notifications";
import { useFonts } from "expo-font";
import {
  Syne_400Regular,
  Syne_500Medium,
  Syne_600SemiBold,
  Syne_700Bold,
  Syne_800ExtraBold,
} from "@expo-google-fonts/syne";
import { setupAndroidChannel } from "@/services/notification.service";
import { WalletProvider } from "@/providers/WalletProvider";
import "../styles/global.css";

const syneFontMap: Record<string, string> = {
  "100": "Syne_400Regular",
  "200": "Syne_400Regular",
  "300": "Syne_400Regular",
  "400": "Syne_400Regular",
  "500": "Syne_500Medium",
  "600": "Syne_600SemiBold",
  "700": "Syne_700Bold",
  "800": "Syne_800ExtraBold",
  "900": "Syne_800ExtraBold",
  normal: "Syne_400Regular",
  bold: "Syne_700Bold",
};

// Keep native splash visible until we manually hide it
NativeSplashScreen.preventAutoHideAsync();

// Suppress deprecation warning from dependencies
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Syne_400Regular,
    Syne_500Medium,
    Syne_600SemiBold,
    Syne_700Bold,
    Syne_800ExtraBold,
  });
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    // Ensure every Text/TextInput gets Syne by default before we start
    const injectDefaultFont = (component: typeof Text | typeof TextInput) => {
      const base = { fontFamily: "Syne_400Regular" };
      component.defaultProps = component.defaultProps ?? {};
      const existing = component.defaultProps.style;
      component.defaultProps.style = [base, existing].filter(Boolean);
    };

    injectDefaultFont(Text);
    injectDefaultFont(TextInput);

    const applySyneFont = (component: typeof Text | typeof TextInput) => {
      if (component.defaultProps == null) {
        component.defaultProps = {};
      }
      const existing = component.defaultProps.style;
      component.defaultProps.style = [
        { fontFamily: "Syne_400Regular" },
        existing,
      ].filter(Boolean);

      const originalRender = (component as any).render;
      if (!originalRender) return () => {};

      (component as any).render = function (...args: any[]) {
        const element = originalRender.apply(this, args);
        const incomingStyle = element.props?.style;
        const flattened = StyleSheet.flatten(incomingStyle) || {};
        const weightKey = `${flattened.fontWeight ?? "400"}`;
        const fontFamily = syneFontMap[weightKey] ?? syneFontMap["400"];

        return cloneElement(element, {
          style: [{ fontFamily }, incomingStyle],
        });
      };

      return () => {
        (component as any).render = originalRender;
      };
    };

    const cleanupText = applySyneFont(Text);
    const cleanupTextInput = applySyneFont(TextInput);

    NativeSplashScreen.hideAsync();

    return () => {
      cleanupText?.();
      cleanupTextInput?.();
    };
  }, [fontsLoaded, fontError]);

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

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <WalletProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="loan-application" />
        <Stack.Screen name="collateral-deposit" />
      </Stack>
    </WalletProvider>
  );
}
