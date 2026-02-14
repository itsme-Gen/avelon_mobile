import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState, useMemo } from "react";
import { router } from "expo-router";
import { ProgressDots } from "../../components/progressdot/ProgressDot";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ContactInformation() {
    const [contactNumber, setContactNumber] = useState("");
    const [email, setEmail] = useState("");
    const insets = useSafeAreaInsets();

    // Check if all required fields are filled
    const isFormValid = useMemo(() => {
        return contactNumber.trim() !== "" && email.trim() !== "";
    }, [contactNumber, email]);

    return (
        <View className="flex-1 bg-gray-50 px-6 pt-12">
            {/* Header Section */}
            <View className="mb-8 mt-10">
                <Text className="text-2xl font-bold text-gray-900 mb-3">
                    Contact Information
                </Text>
                <Text className="text-md text-gray-600 leading-5">
                    Please provide your phone number and email address below. 
                    These details will be used to send updates and keep you 
                    informed about our services. You can update this information 
                    anytime from your account settings, or skip this step if you wish.
                </Text>
            </View>

            {/* Input Fields */}
            <View className="mb-8">
                <TextInput
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3.5 text-base text-gray-900 mb-4"
                    placeholder="Contact Number"
                    placeholderTextColor="#9CA3AF"
                    value={contactNumber}
                    onChangeText={setContactNumber}
                    keyboardType="phone-pad"
                />
                
                <TextInput
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3.5 text-base text-gray-900"
                    placeholder="Secondary Email Address"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            {/* Spacer to push buttons to bottom */}
            <View className="flex-1" />

            {/* Progress Dots - Step 2 of 3 */}
            <ProgressDots currentStep={1} totalSteps={3} />

            {/* Action Buttons */}
            <View 
                className="flex-row gap-3 mb-8"
                style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
                <TouchableOpacity 
                    className="flex-1 bg-gray-200 rounded-full py-4 items-center"
                    activeOpacity={0.7}
                    onPress={() => router.back()}
                >
                    <Text className="text-base font-semibold text-gray-900">
                        Back
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    className={`flex-1 rounded-full py-4 items-center ${
                        isFormValid ? "bg-black" : "bg-gray-300"
                    }`}
                    activeOpacity={0.8}
                    onPress={() => {
                        if (isFormValid) {
                            router.push("/(verification)/IDVerification");
                        }
                    }}
                    disabled={!isFormValid}
                >
                    <Text className={`text-base font-semibold ${
                        isFormValid ? "text-white" : "text-gray-500"
                    }`}>
                        Next
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}