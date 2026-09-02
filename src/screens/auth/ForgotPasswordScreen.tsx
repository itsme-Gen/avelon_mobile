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
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import * as authService from "@/services/auth.service";
import { validateEmail } from "@/utils/validation.util";

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOTP = async () => {
        // Validate email using shared validator
        const emailError = validateEmail(email);
        if (emailError) {
            Alert.alert("Validation Error", emailError);
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.forgotPassword(email.trim());

            if (response.success) {
                Alert.alert(
                    "Email Sent",
                    "If an account exists with this email, you will receive a six-digit password reset code.",
                    [
                        {
                            text: "OK",
                            onPress: () => router.push({
                                pathname: "/(auth)/forgot-password/otp",
                                params: { email: email.trim().toLowerCase() },
                            }),
                        },
                    ]
                );
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to send reset email";
            Alert.alert("Error", message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View style={{ flex: 1 }}>
                {/* Back Button */}
                <TouchableOpacity
                    className="absolute top-4 left-4 z-10 p-2"
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>

                {/* Scrollable Content */}
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
                                    <Text className="text-black text-3xl font-semibold mb-4">
                                        Forgot Password
                                    </Text>
                                    <Text className="text-gray-500 text-center mb-10 px-4">
                                        Enter your email address and we'll send you a six-digit code to reset your password.
                                    </Text>
                                </View>

                                <View className="mb-4">
                                    <Text className="text-black font-bold text-lg ml-4 mb-2">
                                        Email
                                    </Text>
                                    <View className="flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2">
                                        <Ionicons name="mail-outline" size={20} color="gray" />
                                        <TextInput
                                            className="ml-2 flex-1 py-3"
                                            placeholder="Enter your Email"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            value={email}
                                            onChangeText={setEmail}
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
                        onPress={handleSendOTP}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-bold">Send Reset Code</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
