import { Stack } from "expo-router";
import { LogBox } from 'react-native';
import "../styles/global.css";

// Suppress deprecation warning from dependencies
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
}
