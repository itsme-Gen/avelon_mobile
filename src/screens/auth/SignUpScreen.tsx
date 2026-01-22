import {
    View,
    Text,
    Image,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";

// Password requirements from backend
const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    hasUppercase: /[A-Z]/,
    hasLowercase: /[a-z]/,
    hasNumber: /[0-9]/,
    hasSpecial: /[^A-Za-z0-9]/,
};

function validatePassword(password: string): string | null {
    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
        return "Password must be at least 8 characters";
    }
    if (!PASSWORD_REQUIREMENTS.hasUppercase.test(password)) {
        return "Password must contain at least one uppercase letter";
    }
    if (!PASSWORD_REQUIREMENTS.hasLowercase.test(password)) {
        return "Password must contain at least one lowercase letter";
    }
    if (!PASSWORD_REQUIREMENTS.hasNumber.test(password)) {
        return "Password must contain at least one number";
    }
    if (!PASSWORD_REQUIREMENTS.hasSpecial.test(password)) {
        return "Password must contain at least one special character";
    }
    return null;
}

export default function SignUpScreen() {
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, isLoading, clearError } = useAuthStore();

    const handleSignUp = async () => {
        clearError();

        // Basic validation
        if (!firstName.trim()) {
            Alert.alert("Validation Error", "Please enter your first name");
            return;
        }
        if (!lastName.trim()) {
            Alert.alert("Validation Error", "Please enter your last name");
            return;
        }
        if (!email.trim()) {
            Alert.alert("Validation Error", "Please enter your email");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Validation Error", "Please enter a valid email address");
            return;
        }

        // Validate password
        const passwordError = validatePassword(password);
        if (passwordError) {
            Alert.alert("Validation Error", passwordError);
            return;
        }

        // Check password match
        if (password !== confirmPassword) {
            Alert.alert("Validation Error", "Passwords do not match");
            return;
        }

        // Build full name
        const fullName = [firstName, middleName, lastName]
            .filter(Boolean)
            .join(" ")
            .trim();

        const result = await register(email.trim(), password, fullName);

        if (result.success) {
            Alert.alert(
                "Registration Successful",
                "Please check your email to verify your account.",
                [{ text: "OK", onPress: () => router.push("/(auth)/signin") }]
            );
        } else {
            Alert.alert("Registration Failed", result.message);
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
                                        Sign up
                                    </Text>
                                </View>

                                {/* FORM */}
                                <View className="w-full mt-10 mb-5">
                                    {/* FIRST NAME */}
                                    <View className="mb-4">
                                        <Text className="text-black font-bold text-lg ml-4 mb-2">
                                            First Name
                                        </Text>
                                        <View className="flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2">
                                            <Ionicons name="person-outline" size={20} color="gray" />
                                            <TextInput
                                                className="ml-2 flex-1 py-3"
                                                placeholder="Enter your First Name"
                                                value={firstName}
                                                onChangeText={setFirstName}
                                                editable={!isLoading}
                                            />
                                        </View>
                                    </View>

                                    {/* MIDDLE NAME */}
                                    <View className="mb-4">
                                        <Text className="text-black font-bold text-lg ml-4 mb-2">
                                            Middle Name <Text className="text-gray-400 font-normal">(Optional)</Text>
                                        </Text>
                                        <View className="flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2">
                                            <Ionicons name="person-outline" size={20} color="gray" />
                                            <TextInput
                                                className="ml-2 flex-1 py-3"
                                                placeholder="Enter your Middle Name"
                                                value={middleName}
                                                onChangeText={setMiddleName}
                                                editable={!isLoading}
                                            />
                                        </View>
                                    </View>

                                    {/* LAST NAME */}
                                    <View className="mb-4">
                                        <Text className="text-black font-bold text-lg ml-4 mb-2">
                                            Last Name
                                        </Text>
                                        <View className="flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2">
                                            <Ionicons name="person-outline" size={20} color="gray" />
                                            <TextInput
                                                className="ml-2 flex-1 py-3"
                                                placeholder="Enter your Last Name"
                                                value={lastName}
                                                onChangeText={setLastName}
                                                editable={!isLoading}
                                            />
                                        </View>
                                    </View>

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
                                                placeholder="Create a Password"
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
                                        <Text className="text-gray-500 text-xs ml-4 mt-1">
                                            Min 8 chars, uppercase, lowercase, number, special char
                                        </Text>
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
                                                value={confirmPassword}
                                                onChangeText={setConfirmPassword}
                                                editable={!isLoading}
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

                {/* Bottom Section */}
                <View className="mb-10 px-5 py-10 bg-white border-t border-gray-100">
                    <View className="flex flex-row justify-center items-center mb-3">
                        <Text>Already have an Account?</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(auth)/signin')}
                            disabled={isLoading}
                        >
                            <Text className="text-black font-bold"> Log in</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className={`w-full justify-center items-center py-4 rounded-full ${isLoading ? 'bg-gray-400' : 'bg-black'}`}
                        onPress={handleSignUp}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-bold">Sign Up</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
