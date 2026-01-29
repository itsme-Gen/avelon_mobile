import LandingScreen from "@/screens/onboarding/LandingScreen";
import { useAuthStore } from "@/stores/auth.store";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
    const { isAuthenticated, checkSession } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            await checkSession();
            setIsLoading(false);
        };
        initAuth();
    }, [checkSession]);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (isAuthenticated) {
        return <Redirect href="/(tabs)/Home" />;
    }

    return <LandingScreen />;
}
