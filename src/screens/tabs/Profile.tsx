import { useAuthStore } from "@/stores/auth.store";
import { useVerificationStore } from "@/stores/verification.store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChangePasswordScreen from "../../screens/settings/ChangePasswordScreen";
import EditProfileScreen from "../../screens/settings/EditProfileScreen";
import FAQsScreen from "../../screens/settings/FAQsScreen";
import LegalScreen from "../../screens/settings/LegalScreen";
import LoanHistoryScreen from "../../screens/settings/LoanHistoryScreen";
import NotificationsScreen from "../../screens/settings/NotificationsScreen";
import ProfileSettings from "../../screens/settings/ProfileSettings";
import SupportScreen from "../../screens/settings/SupportScreen";

export default function Profile() {
  const [showVerification, setShowVerification] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLoanHistory, setShowLoanHistory] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showFAQs, setShowFAQs] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const { isVerified } = useVerificationStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const renderVerifyBanner = !isVerified ? (
    <View className="bg-white border border-gray-200 rounded-2xl p-4 mx-4 mb-6 flex-row items-center justify-between">
      <View className="flex-1 mr-3">
        <Text className="text-base font-semibold text-gray-900">
          Verify your account
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Verify your account now to see details.
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setShowVerification(true)}
        className="bg-black px-4 py-2 rounded-full"
      >
        <Text className="text-white font-semibold text-sm">Verify</Text>
      </TouchableOpacity>
    </View>
  ) : null;

  if (showNotifications) {
    return <NotificationsScreen onBack={() => setShowNotifications(false)} />;
  }

  if (showLoanHistory) {
    return <LoanHistoryScreen onBack={() => setShowLoanHistory(false)} />;
  }

  if (showEditProfile) {
    return <EditProfileScreen onBack={() => setShowEditProfile(false)} />;
  }

  if (showChangePassword) {
    return <ChangePasswordScreen onBack={() => setShowChangePassword(false)} />;
  }

  if (showSupport) {
    return <SupportScreen onBack={() => setShowSupport(false)} />;
  }

  if (showFAQs) {
    return <FAQsScreen onBack={() => setShowFAQs(false)} />;
  }

  if (showLegal) {
    return <LegalScreen onBack={() => setShowLegal(false)} />;
  }

  if (showVerification) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-50"
        edges={["right", "bottom", "left"]}
      >
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
              To ensure secure access and the proper use of Avelon's features
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      edges={["right", "bottom", "left"]}
    >
      {/* Profile Screen */}
      <View className="flex-1">
        {/* Profile Info */}
        <TouchableOpacity
          onPress={() => setShowEditProfile(true)}
          className="flex-row items-center justify-between px-6 py-3 bg-white mx-4 mt-2 rounded-2xl mb-6"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
              <Ionicons name="person" size={24} color="#9CA3AF" />
            </View>
            <View>
              <Text className="text-base font-semibold">
                {user?.name || "User"}
              </Text>
              <Text className="text-sm text-gray-500">{user?.email || ""}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {renderVerifyBanner}

        {/* Profile Settings always visible */}
        <ProfileSettings
          onOpenNotifications={() => setShowNotifications(true)}
          onOpenLoanHistory={() => setShowLoanHistory(true)}
          onOpenChangePassword={() => setShowChangePassword(true)}
          onOpenEditProfile={() => setShowEditProfile(true)}
          onOpenSupport={() => setShowSupport(true)}
          onOpenFAQs={() => setShowFAQs(true)}
          onOpenLegal={() => setShowLegal(true)}
        />

        {/* Bottom Navigation */}
        <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-around bg-white py-4 px-6">
          <TouchableOpacity className="items-center">
            <Ionicons name="home-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Ionicons name="wallet-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Ionicons name="document-text-outline" size={24} color="#9CA3AF" />
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
    </SafeAreaView>
  );
}
