import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useVerificationStore } from '@/stores/verification.store';

export default function Success() {
    const markVerified = useVerificationStore((state) => state.markVerified);
    return (
        <View className="flex-1 bg-white items-center justify-center px-8">
            {/* Success Icon */}
            <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-8">
                <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center">
                    <Ionicons name="checkmark" size={48} color="#fff" />
                </View>
            </View>

            {/* Title */}
            <Text className="text-2xl font-bold mb-4 text-center">
                Verification Complete!
            </Text>

            {/* Description */}
            <Text className="text-gray-600 text-center leading-6 mb-12">
                Your account has been successfully verified. You can now access all features and settings.
            </Text>

            {/* Continue Button */}
            <TouchableOpacity
                onPress={() => {
                    markVerified();
                    router.replace("/(tabs)/Home");
                }}
                className="bg-black w-full py-4 rounded-full"
            >
                <Text className="text-white font-semibold text-base text-center">
                    Proceed
                </Text>
            </TouchableOpacity>
        </View>
    );
}
