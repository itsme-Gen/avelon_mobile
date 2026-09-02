import * as authService from "@/services/auth.service";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OTPScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(otp)) {
      Alert.alert("Invalid Code", "Enter the six-digit code from your email.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.validateResetToken(otp);
      router.replace({
        pathname: "/(auth)/forgot-password/reset",
        params: { token: otp },
      });
    } catch (error) {
      Alert.alert(
        "Verification Failed",
        error instanceof Error ? error.message : "The code is invalid or expired.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      router.replace("/(auth)/forgot-password");
      return;
    }
    setIsResending(true);
    try {
      await authService.forgotPassword(email);
      setOtp("");
      Alert.alert("Code Sent", "If the account exists, a new reset code was sent.");
    } catch (error) {
      Alert.alert("Unable to Resend", error instanceof Error ? error.message : "Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 px-6">
        <TouchableOpacity className="mt-4 p-2 self-start" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <View className="flex-1 justify-center">
          <Text className="text-black text-3xl font-semibold text-center mb-3">Enter Reset Code</Text>
          <Text className="text-gray-500 text-center mb-8">
            Enter the six-digit code sent to {email || "your email address"}. It expires after one hour.
          </Text>

          <View className="flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2">
            <Ionicons name="keypad-outline" size={20} color="gray" />
            <TextInput
              className="ml-2 flex-1 py-3 text-center tracking-[8px]"
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(value) => setOtp(value.replace(/\D/g, ""))}
              editable={!isLoading && !isResending}
              textContentType="oneTimeCode"
            />
          </View>

          <TouchableOpacity className="mt-5 self-center" onPress={handleResend} disabled={isResending || isLoading}>
            <Text className="text-sm font-semibold text-[#e97830]">
              {isResending ? "Sending…" : "Resend code"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className={`w-full items-center py-4 rounded-full mb-10 ${isLoading ? "bg-gray-400" : "bg-black"}`}
          onPress={handleVerify}
          disabled={isLoading || isResending}
        >
          {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Verify Code</Text>}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
