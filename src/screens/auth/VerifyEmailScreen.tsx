import { SafeAreaView } from "react-native-safe-area-context";
import {
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { verifyEmail } from "@/services/auth.service";

export default function VerifyEmailScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert("Error", "Please enter the 6-digit OTP");
            return;
        }

        setIsLoading(true);
        try {
            const result = await verifyEmail(otp);
            if (result.success) {
                Alert.alert(
                    "Success",
                    "Email verified successfully! You can now log in.",
                    [{ text: "OK", onPress: () => router.push("/(auth)/signin") }]
                );
            } else {
                Alert.alert("Verification Failed", result.message || "Invalid OTP");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to verify email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{
                            paddingHorizontal: 24,
                            paddingTop: 24,
                            paddingBottom: 20,
                        }}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View>
                                {/* LOGO */}
                                <View className="items-center">
                                    <Image
                                        source={require("../../../assets/images/avelon_nobg.png")}
                                        className="w-full h-48"
                                        resizeMode="contain"
                                    />

                                    {/* TITLE */}
                                    <Text className="text-black text-3xl font-semibold mb-2">
                                        Verify Email
                                    </Text>
                                    <Text className="text-gray-500 text-center mb-10 px-4">
                                        We sent a 6-digit code to {email}. Please enter it below.
                                    </Text>
                                </View>

                                <View className="mb-4">
                                    <Text className="text-black font-bold text-lg ml-4 mb-2">
                                        OTP
                                    </Text>
                                    <View className="flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2">
                                        <Ionicons name="keypad-outline" size={20} color="gray" />
                                        <TextInput
                                            className="ml-2 flex-1 py-3"
                                            placeholder="Enter 6-digit OTP"
                                            keyboardType="number-pad"
                                            autoCapitalize="none"
                                            maxLength={6}
                                            value={otp}
                                            onChangeText={setOtp}
                                            editable={!isLoading}
                                        />
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Fixed Bottom Section */}
                <View className="mb-10 px-5 py-4 bg-white border-t border-gray-100">
                    <TouchableOpacity
                        className={`w-full justify-center items-center py-4 rounded-full ${isLoading ? 'bg-gray-400' : 'bg-black'}`}
                        onPress={handleVerifyOTP}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-bold">Verify OTP</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
