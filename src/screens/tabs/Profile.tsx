import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileSettings from "../../screens/settings/ProfileSettings" // Adjust path as needed

export default function Profile() {
  const [showVerification, setShowVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // TODO: Replace with actual backend state
  const router = useRouter();
  const params = useLocalSearchParams();

  // Check if user just completed verification
  useEffect(() => {
    if (params.verified === 'true') {
      setIsVerified(true);
    }
  }, [params.verified]);

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      edges={["right", "bottom", "left"]}
    >
      {!showVerification ? (
        // Profile Screen
        <View className="flex-1">
          {/* Profile Info */}
          <TouchableOpacity className="flex-row items-center justify-between px-6 py-3 bg-white mx-4 mt-2 rounded-2xl mb-6">
            <View className="flex-row items-center gap-3">
              <Image
                source={{ uri: "https://via.placeholder.com/50" }}
                className="w-12 h-12 rounded-full"
              />
              <View>
                <Text className="text-base font-semibold">Jerie Lacap</Text>
                <Text className="text-sm text-gray-500">jerie@avaion.com</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {!isVerified ? (
            // Verification Card (Before Verification)
            <View className="items-center px-6 py-8">
              <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6">
                <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center">
                  <Ionicons name="shield-checkmark" size={32} color="#fff" />
                </View>
              </View>

              <Text className="text-base text-gray-700 mb-6 text-center">
                verify your account now to see details!
              </Text>

              <TouchableOpacity
                onPress={() => setShowVerification(true)}
                className="bg-black px-12 py-4 rounded-full"
              >
                <Text className="text-white font-semibold text-base">
                  Verify Account
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Profile Settings (After Verification)
            <ProfileSettings onResetVerification={() => setIsVerified(false)} />
          )}

          {/* Bottom Navigation */}
          <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-around bg-white py-4 px-6 border-t border-gray-200">
            <TouchableOpacity className="items-center">
              <Ionicons name="home-outline" size={24} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <Ionicons name="wallet-outline" size={24} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#9CA3AF"
              />
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <Ionicons name="newspaper-outline" size={24} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <View className="w-10 h-10 bg-orange-400 rounded-full items-center justify-center">
                <Ionicons name="person" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Verification Screen
        <View className="flex-1 bg-white">
          {/* Close Button */}
          <TouchableOpacity
            onPress={() => setShowVerification(false)}
            className="absolute top-3 right-6 z-10 w-10 h-10 items-center justify-center"
          >
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>

          {/* Content */}
          <View className="flex-1 items-center justify-center px-8">
            {/* Icon */}
            <View className="relative mb-12">
              <View className="w-32 h-32 items-center justify-center">
                {/* Orange pen/edit icon */}
                <View className="absolute top-0 right-0">
                  <View className="bg-orange-400 w-20 h-24 rounded-lg items-center justify-center">
                    <View className="w-12 h-16">
                      {/* Stylized pen strokes */}
                      <View className="absolute top-2 left-2 w-2 h-12 bg-white rounded-full rotate-45" />
                      <View className="absolute top-4 left-6 w-2 h-10 bg-white rounded-full rotate-45" />
                      <View className="absolute top-6 left-10 w-2 h-8 bg-white rounded-full rotate-45" />
                    </View>
                  </View>
                </View>
                {/* Blue shield icon */}
                <View className="absolute bottom-0 left-4 w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
                  <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center">
                    <Ionicons name="shield-checkmark" size={24} color="#fff" />
                  </View>
                </View>
              </View>
            </View>

            {/* Title */}
            <Text className="text-2xl font-bold mb-4 text-center">
              Let's get you verified
            </Text>

            {/* Description */}
            <Text className="text-gray-600 text-center leading-6 mb-12">
              To ensure secure access and the proper use of Avaion's features
              and services, we kindly request that you verify your identity.
              This verification is necessary to confirm your authenticity.
            </Text>

            {/* Get Started Button */}
            <TouchableOpacity
              onPress={() => router.push("/(verification)/BasicInformation")}
              className="bg-black w-full py-4 rounded-full"
            >
              <Text className="text-white font-semibold text-base text-center">
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}