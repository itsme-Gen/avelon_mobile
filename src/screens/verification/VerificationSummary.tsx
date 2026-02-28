import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ProgressDots } from '../../components/progressdot/ProgressDot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVerificationStore } from '@/stores/verification.store';
import { CustomAlert } from '../../components/alertbutton/CustomAlert';
import * as kycService from '@/services/kyc.service';

export default function VerificationSummary() {
    const insets = useSafeAreaInsets();
    const basicInfo = useVerificationStore((s) => s.basicInfo);
    const contactInfo = useVerificationStore((s) => s.contactInfo);
    const idDocuments = useVerificationStore((s) => s.idDocuments);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState({
        visible: false,
        title: '',
        message: '',
        icon: undefined as any,
        iconColor: '#111827',
        buttons: [] as any[],
    });

    const handleVerify = async () => {
        setIsSubmitting(true);
        try {
            // Step 1: Submit profile info
            const profileResult = await kycService.submitKycProfile({
                dateOfBirth: basicInfo.dateOfBirth,
                gender: basicInfo.gender,
                civilStatus: basicInfo.civilStatus,
                educationLevel: basicInfo.educationLevel,
                country: basicInfo.country,
                region: basicInfo.region || undefined,
                province: basicInfo.province || undefined,
                cityTown: basicInfo.cityTown || undefined,
                barangay: basicInfo.barangay || undefined,
                contactNumber: contactInfo.contactNumber,
                secondaryEmail: contactInfo.secondaryEmail || undefined,
            });

            if (!profileResult.success) {
                setAlert({
                    visible: true,
                    title: 'Profile Error',
                    message: profileResult.error || 'Failed to save profile information.',
                    icon: 'alert-circle-outline',
                    iconColor: '#EF4444',
                    buttons: [{ text: 'OK' }],
                });
                setIsSubmitting(false);
                return;
            }

            // Step 2: Upload documents
            const uploads = [
                { uri: idDocuments.frontUri, type: 'GOVERNMENT_ID' as const },
                { uri: idDocuments.backUri, type: 'GOVERNMENT_ID_BACK' as const },
                { uri: idDocuments.signatureUri, type: 'E_SIGNATURE' as const },
            ];

            for (const doc of uploads) {
                if (!doc.uri) continue;
                const uploadResult = await kycService.uploadDocument(doc.uri, doc.type);
                if (!uploadResult.success) {
                    setAlert({
                        visible: true,
                        title: 'Upload Error',
                        message: uploadResult.error || `Failed to upload ${doc.type}.`,
                        icon: 'cloud-upload-outline',
                        iconColor: '#EF4444',
                        buttons: [{ text: 'OK' }],
                    });
                    setIsSubmitting(false);
                    return;
                }
            }

            // Step 3: Submit KYC for review
            const submitResult = await kycService.submitKyc();
            if (!submitResult.success) {
                setAlert({
                    visible: true,
                    title: 'Submission Error',
                    message: submitResult.error || 'Failed to submit KYC.',
                    icon: 'alert-circle-outline',
                    iconColor: '#EF4444',
                    buttons: [{ text: 'OK' }],
                });
                setIsSubmitting(false);
                return;
            }

            // Success — navigate to success screen
            router.push("/(verification)/Success" as any);
        } catch (error) {
            console.error('[VerificationSummary] Submit error:', error);
            setAlert({
                visible: true,
                title: 'Error',
                message: 'Something went wrong. Please try again.',
                icon: 'alert-circle-outline',
                iconColor: '#EF4444',
                buttons: [{ text: 'OK' }],
            });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        You've almost completed the essential steps for verifying your account. Please review the information you've provided, then submit your application.
                    </Text>

                    {/* Note */}
                    <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <Text className="text-sm text-blue-800 leading-5">
                            If everything looks correct, tap Verify to submit your application. If you want to change something, use the Back button to return to the form.
                        </Text>
                    </View>

                    {/* Basic Information Section */}
                    <Text className="text-base font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                        BASIC INFORMATION
                    </Text>

                    <View className="space-y-4 mb-6">
                        <InfoItem icon="calendar-outline" label={basicInfo.dateOfBirth || "Not set"} />
                        <InfoItem icon="male-outline" label={basicInfo.gender || "Not set"} />
                        <InfoItem icon="person-outline" label={basicInfo.civilStatus || "Not set"} />
                        <InfoItem icon="school-outline" label={basicInfo.educationLevel || "Not set"} />
                        <InfoItem icon="flag-outline" label={basicInfo.country || "Not set"} />
                        {basicInfo.region ? <InfoItem icon="location-outline" label={basicInfo.region} /> : null}
                        {basicInfo.province ? <InfoItem icon="location-outline" label={basicInfo.province} /> : null}
                        {basicInfo.cityTown ? <InfoItem icon="location-outline" label={basicInfo.cityTown} /> : null}
                        {basicInfo.barangay ? <InfoItem icon="location-outline" label={basicInfo.barangay} /> : null}
                    </View>

                    {/* Contact Information Section */}
                    <Text className="text-base font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                        CONTACT INFORMATION
                    </Text>

                    <View className="space-y-4 mb-6">
                        <InfoItem icon="call-outline" label={contactInfo.contactNumber || "Not set"} />
                        <InfoItem icon="mail-outline" label={contactInfo.secondaryEmail || "Not set"} />
                    </View>

                    {/* ID Documents Section */}
                    <Text className="text-base font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                        ID DOCUMENTS
                    </Text>

                    <View className="space-y-3 mb-8">
                        <DocPreview label="ID Front" uri={idDocuments.frontUri} />
                        <DocPreview label="ID Back" uri={idDocuments.backUri} />
                        <DocPreview label="E-Signature" uri={idDocuments.signatureUri} />
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
                        disabled={isSubmitting}
                    >
                        <Text className="text-center text-gray-900 font-semibold text-base">
                            Back
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 rounded-full py-4 ${isSubmitting ? 'bg-gray-400' : 'bg-black'}`}
                        onPress={handleVerify}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-center text-white font-semibold text-base">
                                Verify
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Alert Modal */}
            <CustomAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                buttons={alert.buttons}
                onClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
                icon={alert.icon}
                iconColor={alert.iconColor}
            />
        </View>
    );
}

// Info Item Component
function InfoItem({ icon, label }: { icon: string; label: string }) {
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

// Document thumbnail preview
function DocPreview({ label, uri }: { label: string; uri: string | null }) {
    return (
        <View className="flex-row items-center bg-white rounded-lg p-3 border border-gray-200">
            {uri ? (
                <Image source={{ uri }} className="w-12 h-12 rounded-md mr-3" resizeMode="cover" />
            ) : (
                <View className="w-12 h-12 rounded-md mr-3 bg-gray-100 items-center justify-center">
                    <Ionicons name="image-outline" size={20} color="#9CA3AF" />
                </View>
            )}
            <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">{label}</Text>
                <Text className="text-xs text-gray-500">{uri ? 'Uploaded' : 'Not uploaded'}</Text>
            </View>
            {uri ? (
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
            ) : (
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
            )}
        </View>
    );
}