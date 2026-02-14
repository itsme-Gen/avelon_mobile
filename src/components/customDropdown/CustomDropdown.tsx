import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

interface DropdownOption {
  code?: string;
  name: string;
}

interface CustomDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onSelect: (option: DropdownOption) => void;
  showIcon?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export const CustomDropdown = ({ 
  label, 
  value, 
  options, 
  onSelect, 
  showIcon = false,
  loading = false,
  disabled = false 
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        onPress={() => !disabled && !loading && setIsOpen(true)}
        disabled={disabled || loading}
        className={`border border-gray-300 rounded-full px-6 py-4 flex-row items-center justify-between ${
          disabled ? "bg-gray-100" : ""
        }`}
      >
        <Text className={`text-base ${value ? "text-black" : "text-gray-400"}`}>
          {loading ? "Loading..." : value || label}
        </Text>
        <View className="flex-row items-center gap-2">
          {showIcon && !loading && (
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
              <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                <Ionicons name="shield-checkmark" size={16} color="#fff" />
              </View>
            </View>
          )}
          {loading ? (
            <ActivityIndicator size="small" color="#9CA3AF" />
          ) : (
            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
          )}
        </View>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setIsOpen(false)}
        >
          <Pressable className="bg-white rounded-t-3xl max-h-96">
            <View className="p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold">{label}</Text>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {options.length === 0 ? (
                  <Text className="text-center text-gray-400 py-8">No options available</Text>
                ) : (
                  options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        onSelect(option);
                        setIsOpen(false);
                      }}
                      className={`py-4 border-b border-gray-200 ${
                        value === option.name ? "bg-blue-50" : ""
                      }`}
                    >
                      <Text
                        className={`text-base ${
                          value === option.name ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        {option.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};