import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { changePassword } from "@/services/auth.service";
import { validatePassword, validatePasswordMatch } from "@/utils/validation.util";

interface ChangePasswordScreenProps {
  onBack: () => void;
}

export default function ChangePasswordScreen({ onBack }: ChangePasswordScreenProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword.trim()) {
      Alert.alert("Error", "Please enter your current password.");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      Alert.alert("Error", passwordError);
      return;
    }

    const matchError = validatePasswordMatch(newPassword, confirmPassword);
    if (matchError) {
      Alert.alert("Error", matchError);
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert("Success", "Your password has been changed.", [
        { text: "OK", onPress: onBack },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["right", "bottom", "left"]}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
        >
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 ml-3">Change Password</Text>
      </View>

      <View className="px-5 pt-6">
        {/* Current Password */}
        <Text className="text-sm font-medium text-gray-700 mb-1.5">Current Password</Text>
        <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 mb-4">
          <TextInput
            className="flex-1 py-3.5 text-base text-gray-900"
            secureTextEntry={!showCurrent}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
            <Ionicons name={showCurrent ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* New Password */}
        <Text className="text-sm font-medium text-gray-700 mb-1.5">New Password</Text>
        <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 mb-4">
          <TextInput
            className="flex-1 py-3.5 text-base text-gray-900"
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity onPress={() => setShowNew(!showNew)}>
            <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <Text className="text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</Text>
        <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 mb-6">
          <TextInput
            className="flex-1 py-3.5 text-base text-gray-900"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`py-4 rounded-full items-center ${isSubmitting ? "bg-gray-300" : "bg-black"}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Change Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
