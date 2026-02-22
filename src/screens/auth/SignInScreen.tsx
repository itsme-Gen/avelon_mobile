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
import { useAuthStore } from "@/stores/auth.store";
import { validateEmail } from "@/utils/validation.util";

export default function SignInScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { login, isLoading, error, clearError } = useAuthStore();

    const handleLogin = async () => {
        // Clear previous errors
        clearError();

        // Validate email
        const emailError = validateEmail(email);
        if (emailError) {
            Alert.alert("Validation Error", emailError);
            return;
        }

        // Validate password
        if (!password) {
            Alert.alert("Validation Error", "Please enter your password");
            return;
        }

        const success = await login(email.trim().toLowerCase(), password);

        if (success) {
            router.replace("/(tabs)/Home");
        } else {
            const errorMessage = useAuthStore.getState().error;
            Alert.alert("Login Failed", errorMessage || "Invalid email or password");
        }
    };

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
                                    <Text className="text-black text-3xl font-bold mb-10">
                                        Log In
                                    </Text>
                                </View>

                                {/* FORM */}
                                <View className="w-full mt-10">
                                    {/* EMAIL */}
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

                                    {/* PASSWORD */}
                                    <View className="mb-4">
                                        <Text className="text-black font-bold text-lg ml-4 mb-2">
                                            Password
                                        </Text>
                                        <View className="flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2">
                                            <Ionicons
                                                name="lock-closed-outline"
                                                size={20}
                                                color="gray"
                                            />
                                            <TextInput
                                                className="ml-2 flex-1 py-3"
                                                placeholder="Enter your Password"
                                                secureTextEntry={!showPassword}
                                                value={password}
                                                onChangeText={setPassword}
                                                editable={!isLoading}
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

                                    {/* FORGOT PASSWORD */}
                                    <View className="items-end mb-10">
                                        <TouchableOpacity
                                            onPress={() => router.push('/(auth)/forgot-password')}
                                            disabled={isLoading}
                                        >
                                            <Text className="text-black font-semibold">Forgot Password?</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Fixed Bottom Section */}
                <View className="mb-10 px-5 py-4 bg-white border-t border-gray-100">
                    <View className="flex flex-row justify-center items-center mb-3">
                        <Text>Don't have an Account?</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(auth)/signup')}
                            disabled={isLoading}
                        >
                            <Text className="text-black font-bold"> Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className={`w-full justify-center items-center py-4 rounded-full ${isLoading ? 'bg-gray-400' : 'bg-black'}`}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-bold">Log In</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
