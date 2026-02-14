import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ProgressDots } from '../../components/progressdot/ProgressDot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VerificationSummary() {
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
            >
                <View className="px-6 py-8">
                    {/* Header */}
                    <Text className="text-2xl font-bold text-gray-900 mb-2 mt-12">
                        Verification Summary
                    </Text>
                    <Text className="text-md text-gray-600 mb-8 leading-5">
                        You've almost completed the 4 essential steps for linking your account. Please review the information you've provided, then send your application.
                    </Text>

                    {/* Note */}
                    <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <Text className="text-sm text-blue-800 leading-5">
                            If everything looks correct, tap Verify to complete your linking steps. If you want to change something, use the Back button to return to the form.
                        </Text>
                    </View>

                    {/* Basic Information Section */}
                    <Text className="text-base font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                        BASIC INFORMATION
                    </Text>

                    {/* Info Items */}
                    <View className="space-y-4 mb-6">
                        <InfoItem 
                            icon="calendar-outline" 
                            label="June 07, 1997" 
                        />
                        <InfoItem 
                            icon="male-outline" 
                            label="Male" 
                        />
                        <InfoItem 
                            icon="person-outline" 
                            label="Single" 
                        />
                        <InfoItem 
                            icon="school-outline" 
                            label="College Graduate" 
                        />
                        <InfoItem 
                            icon="flag-outline" 
                            label="Philippines" 
                        />
                        <InfoItem 
                            icon="location-outline" 
                            label="Ilocos Region" 
                        />
                        <InfoItem 
                            icon="location-outline" 
                            label="Malasiqui" 
                        />
                    </View>

                    {/* Contact Information Section */}
                    <Text className="text-base font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                        CONTACT INFORMATION
                    </Text>

                    <View className="space-y-4 mb-8">
                        <InfoItem 
                            icon="call-outline" 
                            label="09958574125" 
                        />
                        <InfoItem 
                            icon="mail-outline" 
                            label="bosswillPogi@gmail.com" 
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Bottom Section */}
            <View 
                className="absolute bottom-0 left-0 right-0"
                style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
                {/* Progress Dots */}
                <View className="px-6 pt-4 pb-3">
                    <ProgressDots currentStep={3} totalSteps={4} />
                </View>

                {/* Action Buttons */}
                <View className="px-6 pb-4 flex-row gap-3">
                    <TouchableOpacity 
                        className="flex-1 bg-white border border-gray-300 rounded-full py-4"
                        onPress={() => router.back()}
                    >
                        <Text className="text-center text-gray-900 font-semibold text-base">
                            Back
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className="flex-1 bg-black rounded-full py-4"
                        onPress={() => {
                            router.push("/(verification)/Success")
                        }}
                    >
                        <Text className="text-center text-white font-semibold text-base">
                            Verify
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// Info Item Component
function InfoItem({ 
    icon, 
    label
}: { 
    icon: string; 
    label: string;
}) {
    return (
        <View className="flex-row items-center">
            <View className="w-5 h-5 mr-4">
                <Ionicons name={icon as any} size={20} color="#9CA3AF" />
            </View>
            <Text className="text-base text-gray-700 flex-1">
                {label}
            </Text>
        </View>
    );
}