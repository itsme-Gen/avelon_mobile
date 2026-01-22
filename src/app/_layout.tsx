import { Stack } from "expo-router";
import "../styles/global.css";
import { LogBox } from 'react-native';

// Suppress deprecation warning from dependencies
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
        </Stack>
    );
}
