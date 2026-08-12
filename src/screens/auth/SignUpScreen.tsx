import { useAuthStore } from "@/stores/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    getPasswordStrength,
    validateEmail,
    validatePassword,
} from "../../utils/validation.util";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });

  const { register, isLoading, clearError } = useAuthStore();

  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password],
  );

  const getStrengthDisplay = () => {
    if (password.length === 0) return { color: "bg-gray-300", label: "" };
    if (passwordStrength <= 2) return { color: "bg-red-500", label: "Weak" };
    if (passwordStrength <= 4)
      return { color: "bg-yellow-500", label: "Medium" };
    return { color: "bg-green-500", label: "Strong" };
  };

  const isFormValid = useMemo(() => {
    return (
      email.trim() &&
      validateEmail(email) === "" &&
      validatePassword(password) === null &&
      password === confirmPassword &&
      confirmPassword.length > 0
    );
  }, [email, password, confirmPassword]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    switch (field) {
      case "email":
        setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
        break;
      case "password":
        setErrors((prev) => ({
          ...prev,
          password: validatePassword(password) || "",
        }));
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
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value && value !== password ? "Passwords do not match" : "",
      }));
    }
    clearError();
  };

  const handleSignUp = async () => {
    clearError();
    setTouched({ email: true, password: true, confirmPassword: true });

    const emailError = validateEmail(email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      Alert.alert("Validation Error", emailError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrors((prev) => ({ ...prev, password: passwordError }));
      Alert.alert("Validation Error", passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      Alert.alert("Validation Error", "Passwords do not match");
      return;
    }

    const result = await register(email.trim().toLowerCase(), password);

    if (result.success) {
      Alert.alert(
        "Registration Successful",
        "Please check your email to verify your account.",
        [
          {
            text: "OK",
            onPress: () =>
              router.push(
                `/(auth)/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`,
              ),
          },
        ],
      );
    } else {
      Alert.alert("Registration Failed", result.message);
    }
  };

  const strengthDisplay = getStrengthDisplay();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
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
                <View className="items-center">
                  <Image
                    source={require("../../../assets/images/avelon_nobg.png")}
                    className="w-full h-48"
                    resizeMode="contain"
                  />
                  <Text className="text-black text-3xl font-bold mb-10">
                    Sign up
                  </Text>
                </View>

                <View className="w-full mt-10 mb-5">
                  <View className="mb-4">
                    <Text className="text-black font-bold text-lg ml-4 mb-2">
                      Email
                    </Text>
                    <View
                      className={`flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2 ${touched.email && errors.email ? "border-2 border-red-500" : ""}`}
                    >
                      <Ionicons name="mail-outline" size={20} color="gray" />
                      <TextInput
                        className="ml-2 flex-1 py-3"
                        placeholder="e.g., maria.santos@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={email}
                        onChangeText={(value) => {
                          setEmail(value);
                          if (touched.email)
                            setErrors((prev) => ({
                              ...prev,
                              email: validateEmail(value),
                            }));
                        }}
                        onBlur={() => handleBlur("email")}
                        editable={!isLoading}
                        accessibilityLabel="Email input"
                        accessibilityHint="Enter your email address"
                        textContentType="username"
                        autoComplete="email"
                      />
                      {touched.email && !errors.email && email.trim() && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="green"
                        />
                      )}
                    </View>
                    {touched.email && errors.email ? (
                      <Text className="text-red-500 text-xs ml-4 mt-1">
                        {errors.email}
                      </Text>
                    ) : null}
                  </View>

                  <View className="mb-4">
                    <Text className="text-black font-bold text-lg ml-4 mb-2">
                      Password
                    </Text>
                    <View
                      className={`flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2 ${touched.password && errors.password ? "border-2 border-red-500" : ""}`}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="gray"
                      />
                      <TextInput
                        className="ml-2 flex-1 py-3"
                        placeholder="Create a strong password (min 8 chars)"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={(value) => {
                          setPassword(value);
                          if (touched.password)
                            setErrors((prev) => ({
                              ...prev,
                              password: validatePassword(value) || "",
                            }));
                          if (
                            confirmPassword &&
                            touched.confirmPassword &&
                            confirmPassword !== value
                          )
                            setErrors((prev) => ({
                              ...prev,
                              confirmPassword: "Passwords do not match",
                            }));
                          else if (confirmPassword === value)
                            setErrors((prev) => ({
                              ...prev,
                              confirmPassword: "",
                            }));
                        }}
                        onBlur={() => handleBlur("password")}
                        editable={!isLoading}
                        accessibilityLabel="Password input"
                        accessibilityHint="Create a secure password"
                        textContentType="password"
                        autoComplete="password"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons
                          name={
                            showPassword ? "eye-outline" : "eye-off-outline"
                          }
                          size={20}
                          color="gray"
                        />
                      </TouchableOpacity>
                    </View>

                    {password.length > 0 && (
                      <View className="ml-4 mt-2">
                        <View className="flex-row gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <View
                              key={level}
                              className={`h-1 flex-1 rounded ${passwordStrength >= level ? strengthDisplay.color : "bg-gray-300"}`}
                            />
                          ))}
                        </View>
                        {strengthDisplay.label && (
                          <Text
                            className={`text-xs ${passwordStrength <= 2 ? "text-red-500" : passwordStrength <= 4 ? "text-yellow-500" : "text-green-500"}`}
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
                        Start with one uppercase, min 8 chars, lowercase,
                        number, special char
                      </Text>
                    )}
                  </View>

                  <View className="mb-4">
                    <Text className="text-black font-bold text-lg ml-4 mb-2">
                      Confirm Password
                    </Text>
                    <View
                      className={`flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2 ${touched.confirmPassword && errors.confirmPassword ? "border-2 border-red-500" : ""}`}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="gray"
                      />
                      <TextInput
                        className="ml-2 flex-1 py-3"
                        placeholder="Re-enter the same password"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={handleConfirmPasswordChange}
                        onBlur={() => handleBlur("confirmPassword")}
                        editable={!isLoading}
                        accessibilityLabel="Confirm password input"
                        accessibilityHint="Re-enter your password to confirm"
                        textContentType="password"
                        autoComplete="password"
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
                      <TouchableOpacity
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        <Ionicons
                          name={
                            showConfirmPassword
                              ? "eye-outline"
                              : "eye-off-outline"
                          }
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

        <View className="mb-10 px-5 py-10 bg-white border-t border-gray-100">
          <View className="flex flex-row justify-center items-center mb-3">
            <Text>Already have an Account?</Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/signin")}
              disabled={isLoading}
            >
              <Text className="text-black font-bold"> Log in</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className={`w-full justify-center items-center py-4 rounded-full ${!isFormValid || isLoading ? "bg-gray-400" : "bg-black"}`}
            onPress={handleSignUp}
            disabled={!isFormValid || isLoading}
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
