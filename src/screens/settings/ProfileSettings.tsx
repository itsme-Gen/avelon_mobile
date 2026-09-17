import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { logout } from "@/services/auth.service";
import { useState } from "react";
import LogoutConfirmation from "@/components/logoutConfirmation/LogoutConfirmation";

interface SettingsItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  showBorder?: boolean;
  iconColor?: string;
}

interface ProfileSettingsProps {
  onResetVerification?: () => void;
  onOpenNotifications?: () => void;
  onOpenLoanHistory?: () => void;
  onOpenChangePassword?: () => void;
  onOpenEditProfile?: () => void;
  onOpenSupport?: () => void;
  onOpenFAQs?: () => void;
  onOpenLegal?: () => void;
}

function SettingsItem({ 
  icon, 
  label,
  onPress,
  showBorder = false,
  iconColor = "#6B7280"
}: SettingsItemProps) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`flex-row items-center justify-between px-4 py-3.5 ${showBorder ? 'border-t border-gray-100' : ''}`}
    >
      <View className="flex-row items-center gap-3">
        <Ionicons name={icon as any} size={20} color={iconColor} />
        <Text className="text-[15px] text-gray-800">{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

export default function ProfileSettings({ onResetVerification, onOpenNotifications, onOpenLoanHistory, onOpenChangePassword, onOpenEditProfile, onOpenSupport, onOpenFAQs, onOpenLegal }: ProfileSettingsProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [biometricsEnabled] = useState(false);

  const handleLogoutConfirm = async () => {
    try {
      setShowLogoutModal(false);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <View className="mb-3 pt-4">
          <View className="bg-white mx-4 rounded-xl overflow-hidden">
            <SettingsItem
              icon="notifications-outline"
              label="Notifications"
              onPress={() => onOpenNotifications?.()}
            />
          </View>
        </View>

        {/* Security Section */}
        <View className="mb-3 pt-4">
          <Text className="text-sm font-semibold text-gray-400 mb-2 px-6 py-2">
            SECURITY
          </Text>
          <View className="bg-white mx-4 rounded-xl overflow-hidden">
            <SettingsItem 
              icon="lock-closed-outline" 
              label="Change Password" 
              onPress={() => onOpenChangePassword?.()}
            />
            <SettingsItem 
              icon="call-outline" 
              label="Change Phone Number" 
              onPress={() => onOpenEditProfile?.()}
              showBorder
            />
            <SettingsItem 
              icon="keypad-outline" 
              label="Add Pin" 
              onPress={() => Alert.alert("Coming Soon", "PIN setup will be available in a future update.")}
              showBorder
            />
            <TouchableOpacity 
              onPress={() => Alert.alert("Coming Soon", "Biometric authentication will be available in a future update.")}
              className="flex-row items-center justify-between px-4 py-3.5 border-t border-gray-100"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="finger-print-outline" size={20} color="#6B7280" />
                <Text className="text-[15px] text-gray-800">Enable Biometrics</Text>
              </View>
              <View className={`w-12 h-7 rounded-full justify-center ${biometricsEnabled ? 'bg-blue-500' : 'bg-gray-200'}`}>
                <View 
                  className={`w-5 h-5 bg-white rounded-full shadow-sm ${biometricsEnabled ? 'ml-6' : 'ml-1'}`}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loan Management Section */}
        <View className="mb-3">
          <Text className="text-sm font-semibold text-gray-400 mb-2 px-6 py-2">
            LOAN MANAGEMENT
          </Text>
          <View className="bg-white mx-4 rounded-xl overflow-hidden">
            <SettingsItem 
              icon="wallet-outline" 
              label="Current Loan" 
              onPress={() => onOpenLoanHistory?.()}
            />
          </View>
        </View>

        {/* More Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-400 mb-2 px-6 py-2">
            MORE
          </Text>
          <View className="bg-white mx-4 rounded-xl overflow-hidden">
            <SettingsItem 
              icon="chatbubble-ellipses-outline" 
              label="Avalon Support" 
              onPress={() => onOpenSupport?.()}
            />
            <SettingsItem 
              icon="help-circle-outline" 
              label="FAQs" 
              onPress={() => onOpenFAQs?.()}
              showBorder
            />
            <SettingsItem 
              icon="document-text-outline" 
              label="Legal Information" 
              onPress={() => onOpenLegal?.()}
              showBorder
            />
            <TouchableOpacity 
              onPress={() => setShowLogoutModal(true)}
              className="flex-row items-center justify-between px-4 py-3.5 border-t border-gray-100"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text className="text-[15px] text-red-500 font-medium">Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing for tab bar */}
        <View className="h-20" />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
