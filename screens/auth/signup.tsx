import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../app/_layout";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";

export default function Signup() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
                  <Text className="text-black text-3xl font-bold mb-10">
                    Sign up
                  </Text>
                </View>

                {/* FORM */}
                <View className="w-full mt-10 mb-5">
                  {/* FIRST NAME */}
                  <View className="mb-4">
                    <Text className="text-black font-bold text-lg ml-4 mb-2">
                      First Name
                    </Text>
                    <View className="flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2">
                      <Ionicons name="person-outline" size={20} color="gray" />
                      <TextInput
                        className="ml-2 flex-1 py-3"
                        placeholder="Enter your First Name"
                      />
                    </View>
                  </View>

                  {/* MIDDLE NAME */}
                  <View className="mb-4">
                    <Text className="text-black font-bold text-lg ml-4 mb-2">
                      Middle Name
                    </Text>
                    <View className="flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2">
                      <Ionicons name="person-outline" size={20} color="gray" />
                      <TextInput
                        className="ml-2 flex-1 py-3"
                        placeholder="Enter your Middle Name"
                      />
                    </View>
                  </View>

                  {/* LAST NAME */}
                  <View className="mb-4">
                    <Text className="text-black font-bold text-lg ml-4 mb-2">
                      Last Name
                    </Text>
                    <View className="flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2">
                      <Ionicons name="person-outline" size={20} color="gray" />
                      <TextInput
                        className="ml-2 flex-1 py-3"
                        placeholder="Enter your Last Name"
                      />
                    </View>
                  </View>

                  {/* EMAIL */}
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

                  {/* PASSWORD */}
                  <View className="mb-4">
                    <Text className="text-black font-bold text-lg ml-4 mb-2">
                      Password
                    </Text>
                    <View className="flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2">
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="gray"
                      />
                      <TextInput
                        className="ml-2 flex-1 py-3"
                        placeholder="Create a Password"
                        secureTextEntry={!showPassword} 
                      />

                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                          name={showPassword ? "eye-outline" : "eye-off-outline"}  
                          size={20}
                          color="gray"
                        />
                      </TouchableOpacity>
               
                    </View>
                  </View>

                  {/* CONFIRM PASSWORD */}
                  <View className="mb-4">
                    <Text className="text-black font-bold text-lg ml-4 mb-2">
                      Confirm Password
                    </Text>
                    <View className="flex-row items-center bg-[#ECECEC] rounded-full px-4 py-2">
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="gray"
                      />
                      <TextInput
                        className="ml-2 flex-1 py-3"
                        placeholder="Re-enter your Password"
                        secureTextEntry={!showConfirmPassword} 
                      />
                      
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons
                          name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                          size={20}
                          color="gray"
                        />
                      </TouchableOpacity>

                    </View>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom Section */}
        <View className="mb-10 px-5 py-10 bg-white border-t border-gray-100">
          <View className="flex flex-row justify-center items-center mb-3">
            <Text>Already have an Account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignIn')}
            >  
              <Text className="text-black font-bold"> Log in</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-black w-full justify-center items-center py-4 rounded-full"
            onPress={() => alert('Sign Up button pressed')}
          >
            <Text className="text-white text-lg font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}