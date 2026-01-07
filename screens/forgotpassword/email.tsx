import { SafeAreaView } from "react-native-safe-area-context";
import { 
  Text, 
  View, 
  Image, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../app/_layout";
import { useNavigation } from "@react-navigation/native";

export default function ForgotPassword() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View style={{ flex: 1 }}>
        {/* Scrollable Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 20,
            }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View>
                {/* LOGO */}
                <View className="items-center">
                  <Image
                    source={require("../../assets/images/avelon_nobg.png")}
                    className="w-full h-48"
                    resizeMode="contain"
                  />

                  {/* TITLE */}
                  <Text className="text-black text-3xl font-semibold mb-10">
                   Forgot Password
                  </Text>
                </View>

                <View className="mb-4">
                    <Text className="text-black font-bold text-lg ml-4 mb-2">
                      Email
                    </Text>
                    <View className="flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2">
                      <Ionicons name="mail-outline" size={20} color="gray" />
                      <TextInput
                        className="ml-2 flex-1 py-3"
                        placeholder="Enter your Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Fixed Bottom Section */}
        <View className="mb-10 px-5 py-4 bg-white border-t border-gray-100">
          <TouchableOpacity
            className="bg-black w-full justify-center items-center py-4 rounded-full"
            onPress={() => navigation.navigate('OTP')}
          >
            <Text className="text-white text-lg font-bold">Send OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}