
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  onClose: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export function CustomAlert({
  visible,
  title,
  message,
  buttons,
  onClose,
  icon,
  iconColor = '#111827',
}: CustomAlertProps) {
  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
          {/* Icon Section */}
          {icon && (
            <View className="items-center pt-6 pb-4">
              <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center">
                <Ionicons name={icon} size={32} color={iconColor} />
              </View>
            </View>
          )}

          {/* Content Section */}
          <View className="px-6 pb-6">
            <Text className="text-xl font-bold text-gray-900 text-center mb-2">
              {title}
            </Text>
            {message && (
              <Text className="text-sm text-gray-600 text-center leading-5">
                {message}
              </Text>
            )}
          </View>

          {/* Buttons Section */}
          <View className="border-t border-gray-100">
            {buttons.length === 1 ? (
              <TouchableOpacity
                className="py-4 items-center justify-center"
                onPress={() => handleButtonPress(buttons[0])}
              >
                <Text className="text-base font-semibold text-gray-900">
                  {buttons[0].text}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row">
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`flex-1 py-4 items-center justify-center ${
                      index > 0 ? 'border-l border-gray-100' : ''
                    }`}
                    onPress={() => handleButtonPress(button)}
                  >
                    <Text
                      className={`text-base font-semibold ${
                        button.style === 'destructive'
                          ? 'text-red-500'
                          : button.style === 'cancel'
                          ? 'text-gray-500'
                          : 'text-gray-900'
                      }`}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}