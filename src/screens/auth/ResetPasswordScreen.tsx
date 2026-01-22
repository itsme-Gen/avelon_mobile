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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";

export default function ResetPasswordScreen() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View style={{ flex: 1 }}>
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
                                    <Text className="text-black text-3xl font-semibold mb-10">
                                        Reset Password
                                    </Text>
                                </View>

                                <View className="mb-4">
                                    {/* PASSWORD */}
                                    <View className="mb-4">
                                        <Text className="text-black font-bold text-lg ml-4 mb-2">
                                            New Password
                                        </Text>
                                        <View className="flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2">
                                            <Ionicons
                                                name="lock-closed-outline"
                                                size={20}
                                                color="gray"
                                            />
                                            <TextInput
                                                className="ml-2 flex-1 py-3"
                                                placeholder="Create a Password"
                                                secureTextEntry={!showPassword}
                                            />
                                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                <Ionicons
                                                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                                                    size={20}
                                                    color="gray"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* CONFIRM PASSWORD */}
                                    <View className="mb-4">
                                        <Text className="text-black font-bold text-lg ml-4 mb-2">
                                            Confirm Password
                                        </Text>
                                        <View className="flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2">
                                            <Ionicons
                                                name="lock-closed-outline"
                                                size={20}
                                                color="gray"
                                            />
                                            <TextInput
                                                className="ml-2 flex-1 py-3"
                                                placeholder="Re-enter your Password"
                                                secureTextEntry={!showConfirmPassword}
                                            />
                                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                <Ionicons
                                                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                                    size={20}
                                                    color="gray"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Fixed Bottom Section */}
                <View className="mb-10 px-5 py-4 bg-white border-t border-gray-100">
                    <TouchableOpacity
                        className="bg-black w-full justify-center items-center py-4 rounded-full"
                        onPress={() => {
                            alert('Password reset successful!');
                            router.replace('/(auth)/signin');
                        }}
                    >
                        <Text className="text-white text-lg font-bold">Confirm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
