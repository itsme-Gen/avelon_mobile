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
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useMemo } from "react";
import * as authService from "@/services/auth.service";
import {
    validatePassword,
    getPasswordStrength,
    validatePasswordMatch,
} from "@/utils/validation.util";

export default function ResetPasswordScreen() {
    const { token } = useLocalSearchParams<{ token?: string }>();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Error states
    const [errors, setErrors] = useState({
        password: "",
        confirmPassword: "",
    });

    // Track touched fields
    const [touched, setTouched] = useState({
        password: false,
        confirmPassword: false,
    });

    // Calculate password strength
    const passwordStrength = useMemo(
        () => getPasswordStrength(password),
        [password],
    );

    const getStrengthDisplay = () => {
        if (password.length === 0) return { color: "bg-gray-300", label: "" };
        if (passwordStrength <= 2) return { color: "bg-red-500", label: "Weak" };
        if (passwordStrength <= 4) return { color: "bg-yellow-500", label: "Medium" };
        return { color: "bg-green-500", label: "Strong" };
    };

    // Check if form is valid
    const isFormValid = useMemo(() => {
        return (
            validatePassword(password) === null &&
            password === confirmPassword &&
            confirmPassword.length > 0
        );
    }, [password, confirmPassword]);

    // Handle field validation on blur
    const handleBlur = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));

        switch (field) {
            case "password":
                const passwordError = validatePassword(password);
                setErrors((prev) => ({ ...prev, password: passwordError || "" }));
                break;
            case "confirmPassword":
                if (confirmPassword && password !== confirmPassword) {
                    setErrors((prev) => ({
                        ...prev,
                        confirmPassword: "Passwords do not match",
                    }));
                } else {
                    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }
                break;
        }
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        if (touched.confirmPassword) {
            if (value && value !== password) {
                setErrors((prev) => ({
                    ...prev,
                    confirmPassword: "Passwords do not match",
                }));
            } else {
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }
        }
    };

    const handleResetPassword = async () => {
        // Mark all fields as touched
        setTouched({ password: true, confirmPassword: true });

        // Validate password
        const passwordError = validatePassword(password);
        if (passwordError) {
            setErrors((prev) => ({ ...prev, password: passwordError }));
            Alert.alert("Validation Error", passwordError);
            return;
        }

        // Check password match
        const matchError = validatePasswordMatch(password, confirmPassword);
        if (matchError) {
            setErrors((prev) => ({ ...prev, confirmPassword: matchError }));
            Alert.alert("Validation Error", matchError);
            return;
        }

        if (!token) {
            Alert.alert("Error", "Reset token is missing. Please try the reset process again.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.resetPassword(token, password);

            if (response.success) {
                Alert.alert(
                    "Password Reset Successful",
                    "Your password has been updated. Please log in with your new password.",
                    [{ text: "OK", onPress: () => router.replace("/(auth)/signin") }],
                );
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to reset password";
            Alert.alert("Error", message);
        } finally {
            setIsLoading(false);
        }
    };

    const strengthDisplay = getStrengthDisplay();

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
                                        <View
                                            className={`flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2 ${touched.password && errors.password
                                                ? "border-2 border-red-500"
                                                : ""
                                                }`}
                                        >
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
                                                onChangeText={(value) => {
                                                    setPassword(value);
                                                    if (touched.password) {
                                                        const err = validatePassword(value);
                                                        setErrors((prev) => ({
                                                            ...prev,
                                                            password: err || "",
                                                        }));
                                                    }
                                                    // Also update confirm password validation
                                                    if (confirmPassword && touched.confirmPassword && confirmPassword !== value) {
                                                        setErrors((prev) => ({
                                                            ...prev,
                                                            confirmPassword: "Passwords do not match",
                                                        }));
                                                    } else if (confirmPassword === value) {
                                                        setErrors((prev) => ({
                                                            ...prev,
                                                            confirmPassword: "",
                                                        }));
                                                    }
                                                }}
                                                onBlur={() => handleBlur("password")}
                                                editable={!isLoading}
                                                textContentType="newPassword"
                                                autoComplete="password-new"
                                            />
                                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                <Ionicons
                                                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                                                    size={20}
                                                    color="gray"
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Password Strength Indicator */}
                                        {password.length > 0 && (
                                            <View className="ml-4 mt-2">
                                                <View className="flex-row gap-1 mb-1">
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <View
                                                            key={level}
                                                            className={`h-1 flex-1 rounded ${passwordStrength >= level
                                                                ? strengthDisplay.color
                                                                : "bg-gray-300"
                                                                }`}
                                                        />
                                                    ))}
                                                </View>
                                                {strengthDisplay.label && (
                                                    <Text
                                                        className={`text-xs ${passwordStrength <= 2
                                                            ? "text-red-500"
                                                            : passwordStrength <= 4
                                                                ? "text-yellow-500"
                                                                : "text-green-500"
                                                            }`}
                                                    >
                                                        Password strength: {strengthDisplay.label}
                                                    </Text>
                                                )}
                                            </View>
                                        )}

                                        {touched.password && errors.password ? (
                                            <Text className="text-red-500 text-xs ml-4 mt-1">
                                                {errors.password}
                                            </Text>
                                        ) : (
                                            <Text className="text-gray-500 text-xs ml-4 mt-1">
                                                Start with one uppercase, min 8 chars, lowercase, number, special char
                                            </Text>
                                        )}
                                    </View>

                                    {/* CONFIRM PASSWORD */}
                                    <View className="mb-4">
                                        <Text className="text-black font-bold text-lg ml-4 mb-2">
                                            Confirm Password
                                        </Text>
                                        <View
                                            className={`flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2 ${touched.confirmPassword && errors.confirmPassword
                                                ? "border-2 border-red-500"
                                                : ""
                                                }`}
                                        >
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
                                                onChangeText={handleConfirmPasswordChange}
                                                onBlur={() => handleBlur("confirmPassword")}
                                                editable={!isLoading}
                                                textContentType="newPassword"
                                                autoComplete="password-new"
                                            />
                                            {confirmPassword &&
                                                password === confirmPassword &&
                                                !errors.confirmPassword && (
                                                    <Ionicons
                                                        name="checkmark-circle"
                                                        size={20}
                                                        color="green"
                                                    />
                                                )}
                                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                <Ionicons
                                                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                                    size={20}
                                                    color="gray"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        {touched.confirmPassword && errors.confirmPassword ? (
                                            <Text className="text-red-500 text-xs ml-4 mt-1">
                                                {errors.confirmPassword}
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Fixed Bottom Section */}
                <View className="mb-10 px-5 py-4 bg-white border-t border-gray-100">
                    <TouchableOpacity
                        className={`w-full justify-center items-center py-4 rounded-full ${!isFormValid || isLoading ? 'bg-gray-400' : 'bg-black'}`}
                        onPress={handleResetPassword}
                        disabled={!isFormValid || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-bold">Confirm</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
