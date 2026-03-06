import { Ionicons } from "@expo/vector-icons";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SupportScreenProps {
  onBack: () => void;
}

const SUPPORT_EMAIL = "support@avelon.app";

export default function SupportScreen({ onBack }: SupportScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["right", "bottom", "left"]}>
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
        >
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 ml-3">Support</Text>
      </View>

      <View className="px-5 pt-6">
        <View className="bg-white rounded-2xl p-6 items-center">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="chatbubble-ellipses" size={32} color="#3B82F6" />
          </View>
          <Text className="text-lg font-bold text-gray-900 mb-2">Need Help?</Text>
          <Text className="text-sm text-gray-500 text-center leading-5 mb-6">
            Our support team is here to help you with any questions or issues you may have.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
            className="bg-black w-full py-4 rounded-full items-center"
          >
            <Text className="text-white font-semibold text-base">Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
