import Ionicons from "@expo/vector-icons/Ionicons";
import { FC } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

export type TermsModalProps = {
  visible: boolean;
  onClose: () => void;
  onAgree: () => void;
  items: string[];
  title?: string;
};

export const TermsModal: FC<TermsModalProps> = ({
  visible,
  onClose,
  onAgree,
  items,
  title = "TERMS AND CONDITIONS",
}) => (
  <Modal
    transparent
    visible={visible}
    animationType="slide"
    onRequestClose={onClose}
  >
    <View className="flex-1 bg-black/50 items-center justify-center px-5">
      <View
        className="w-full max-h-[85%] bg-white rounded-3xl p-5 flex-1"
        style={{ minHeight: 360 }}
      >
        <View className="items-center mb-4">
          <View className="w-16 h-1.5 rounded-full bg-gray-200" />
        </View>

        <View className="flex-row items-center mb-3">
          <Ionicons name="document-text-outline" size={18} color="#111827" />
          <Text className="text-base font-semibold text-gray-900 ml-2 underline">
            {title}
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <Text className="text-sm text-gray-700 leading-6 mb-4">
            Welcome to Avelon. By using our services, you agree to comply with
            these Terms and Conditions.
          </Text>
          {items && items.length ? (
            <View className="space-y-3">
              {items.map((item, idx) => (
                <Text key={idx} className="text-sm text-gray-800 leading-6">
                  {idx + 1}. {item}
                </Text>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-gray-600">
              Terms are currently unavailable.
            </Text>
          )}
        </ScrollView>

        <View className="mt-4 gap-2">
          <TouchableOpacity
            onPress={onAgree}
            className="bg-black w-full py-4 rounded-full items-center"
          >
            <Text className="text-white font-semibold text-base">I Agree</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} className="py-3 items-center">
            <Text className="text-sm font-semibold text-gray-700">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);
