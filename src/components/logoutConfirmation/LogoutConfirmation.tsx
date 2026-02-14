import { Modal, View, Text, TouchableOpacity } from "react-native";

interface LogoutConfirmationProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmation({ 
  visible, 
  onCancel, 
  onConfirm 
}: LogoutConfirmationProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Logout Confirmation
          </Text>
          <Text className="text-sm text-gray-600 mb-6">
            You're about to log out. Continue?
          </Text>
          
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={onCancel}
              className="flex-1 bg-gray-200 rounded-full py-3.5"
            >
              <Text className="text-center text-gray-900 font-semibold text-base">
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={onConfirm}
              className="flex-1 bg-red-600 rounded-full py-3.5"
            >
              <Text className="text-center text-white font-semibold text-base">
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}