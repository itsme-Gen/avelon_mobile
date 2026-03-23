import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomAlert } from "@/components/alertbutton/CustomAlert";
import * as userService from "@/services/user.service";
import type { UserProfile } from "@/services/user.service";
import { useAuthStore } from "@/stores/auth.store";

interface EditProfileScreenProps {
    onBack: () => void;
}

export default function EditProfileScreen({ onBack }: EditProfileScreenProps) {
    const { user, setUser } = useAuthStore();
    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [alert, setAlert] = useState<{
        visible: boolean;
        title: string;
        message?: string;
        buttons: Array<{ text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }>;
        icon?: keyof typeof Ionicons.glyphMap;
        iconColor?: string;
    }>({ visible: false, title: "", buttons: [] });

    const fetchProfile = useCallback(async () => {
        try {
            const result = await userService.getProfile();
            if (result.success && result.data) {
                setProfile(result.data);
                setName(result.data.name || "");
                setPhone(result.data.phone || "");
            }
        } catch (error) {
            console.error("[EditProfile] Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSave = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setAlert({
                visible: true,
                title: "Name Required",
                message: "Please enter your name.",
                buttons: [{ text: "OK" }],
                icon: "alert-circle",
                iconColor: "#EF4444",
            });
            return;
        }

        setIsSaving(true);
        const updateData: { name?: string; phone?: string } = {};
        if (trimmedName !== (user?.name || "")) updateData.name = trimmedName;
        if (phone.trim()) updateData.phone = phone.trim();

        if (Object.keys(updateData).length === 0) {
            setIsSaving(false);
            onBack();
            return;
        }

        const result = await userService.updateProfile(updateData);
        setIsSaving(false);

        if (result.success) {
            // Update auth store with new data
            if (user && updateData.name) {
                setUser({ ...user, name: updateData.name });
            }
            setAlert({
                visible: true,
                title: "Profile Updated",
                message: "Your profile has been updated successfully.",
                buttons: [{ text: "OK", onPress: onBack }],
                icon: "checkmark-circle",
                iconColor: "#10B981",
            });
        } else {
            setAlert({
                visible: true,
                title: "Update Failed",
                message: result.error || "Could not update profile.",
                buttons: [{ text: "OK" }],
                icon: "alert-circle",
                iconColor: "#EF4444",
            });
        }
    };

    const status = profile?.status || "";
    const statusColor = status === "CONNECTED" ? "text-green-600" : status === "APPROVED" ? "text-blue-600" : "text-yellow-600";
    const statusLabel = status === "CONNECTED" ? "Connected" : status === "APPROVED" ? "Approved" : status || "Pending";

    const primaryWallet = profile?.wallets?.find((w) => w.isPrimary) ?? profile?.wallets?.[0];

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["right", "bottom", "left"]}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={onBack}
                        className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
                    >
                        <Ionicons name="arrow-back" size={20} color="#000" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-gray-900 ml-3">Edit Profile</Text>
                </View>
                <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#000" />
                    ) : (
                        <Text className="text-base font-semibold text-black">Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#1F2937" />
                </View>
            ) : (
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Avatar */}
                        <View className="items-center py-6">
                            <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center mb-2">
                                <Ionicons name="person" size={36} color="#9CA3AF" />
                            </View>
                            <Text className="text-sm text-gray-500">{user?.email || ""}</Text>
                        </View>

                        {/* Editable Fields */}
                        <View className="mx-4 bg-white rounded-2xl p-5">
                            <Text className="text-xs font-semibold text-gray-400 uppercase mb-4">
                                Personal Information
                            </Text>

                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-1.5">Name</Text>
                                <TextInput
                                    className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 border border-gray-200"
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-1.5">Phone</Text>
                                <TextInput
                                    className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 border border-gray-200"
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Enter phone number"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View className="mb-1">
                                <Text className="text-sm font-medium text-gray-700 mb-1.5">Email</Text>
                                <View className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-200">
                                    <Text className="text-sm text-gray-500">{user?.email || ""}</Text>
                                </View>
                                <Text className="text-xs text-gray-400 mt-1">Email cannot be changed</Text>
                            </View>
                        </View>

                        {/* KYC-Verified Info (read-only) */}
                        {(profile?.legalName || profile?.address || profile?.employmentType) && (
                            <View className="mx-4 mt-4 bg-white rounded-2xl p-5">
                                <Text className="text-xs font-semibold text-gray-400 uppercase mb-4">
                                    Verified Information
                                </Text>

                                {profile.legalName && (
                                    <ReadOnlyField label="Legal Name" value={profile.legalName} />
                                )}
                                {profile.address && (
                                    <ReadOnlyField label="Address" value={profile.address} />
                                )}
                                {profile.employmentType && (
                                    <ReadOnlyField
                                        label="Employment"
                                        value={profile.employmentType.replace(/_/g, " ")}
                                    />
                                )}

                                <Text className="text-xs text-gray-400 mt-1">
                                    These fields are verified through KYC and cannot be edited
                                </Text>
                            </View>
                        )}

                        {/* Account Info */}
                        <View className="mx-4 mt-4 bg-white rounded-2xl p-5">
                            <Text className="text-xs font-semibold text-gray-400 uppercase mb-4">
                                Account Info
                            </Text>

                            <View className="flex-row justify-between mb-3">
                                <Text className="text-sm text-gray-500">Status</Text>
                                <Text className={`text-sm font-medium ${statusColor}`}>{statusLabel}</Text>
                            </View>

                            {profile?.creditScore != null && (
                                <View className="flex-row justify-between mb-3">
                                    <Text className="text-sm text-gray-500">Credit Score</Text>
                                    <Text className="text-sm font-bold text-orange-500">{profile.creditScore}</Text>
                                </View>
                            )}

                            {profile?.creditTier && (
                                <View className="flex-row justify-between mb-3">
                                    <Text className="text-sm text-gray-500">Credit Tier</Text>
                                    <Text className="text-sm font-medium text-gray-700">{profile.creditTier}</Text>
                                </View>
                            )}

                            {profile?.createdAt && (
                                <View className="flex-row justify-between mb-3">
                                    <Text className="text-sm text-gray-500">Member Since</Text>
                                    <Text className="text-sm font-medium text-gray-700">
                                        {new Date(profile.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Wallet Info */}
                        {primaryWallet && (
                            <View className="mx-4 mt-4 bg-white rounded-2xl p-5">
                                <Text className="text-xs font-semibold text-gray-400 uppercase mb-4">
                                    Connected Wallet
                                </Text>

                                <View className="flex-row items-center mb-2">
                                    <View className="w-8 h-8 rounded-full bg-blue-100 justify-center items-center mr-3">
                                        <Ionicons name="wallet" size={16} color="#3B82F6" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                                            {primaryWallet.label || "Primary Wallet"}
                                        </Text>
                                        <Text className="text-xs text-gray-400 font-mono" numberOfLines={1}>
                                            {primaryWallet.address}
                                        </Text>
                                    </View>
                                    {primaryWallet.isVerified && (
                                        <View className="bg-green-100 px-2 py-0.5 rounded-full">
                                            <Text className="text-[10px] font-medium text-green-700">Verified</Text>
                                        </View>
                                    )}
                                </View>

                                {(profile?.wallets?.length ?? 0) > 1 && (
                                    <Text className="text-xs text-gray-400 mt-2">
                                        +{(profile?.wallets?.length ?? 1) - 1} more wallet{(profile?.wallets?.length ?? 1) - 1 > 1 ? "s" : ""}
                                    </Text>
                                )}
                            </View>
                        )}

                        {/* Loan Stats */}
                        {(profile?.activeLoansCount != null || profile?.completedLoansCount != null) && (
                            <View className="mx-4 mt-4 bg-white rounded-2xl p-5">
                                <Text className="text-xs font-semibold text-gray-400 uppercase mb-4">
                                    Loan Activity
                                </Text>

                                <View className="flex-row">
                                    <View className="flex-1 items-center">
                                        <Text className="text-xl font-bold text-gray-900">
                                            {profile?.activeLoansCount ?? 0}
                                        </Text>
                                        <Text className="text-xs text-gray-500 mt-1">Active</Text>
                                    </View>
                                    <View className="w-px bg-gray-200" />
                                    <View className="flex-1 items-center">
                                        <Text className="text-xl font-bold text-gray-900">
                                            {profile?.completedLoansCount ?? 0}
                                        </Text>
                                        <Text className="text-xs text-gray-500 mt-1">Completed</Text>
                                    </View>
                                </View>

                                {(profile?.totalBorrowed || profile?.totalRepaid) && (
                                    <View className="border-t border-gray-100 mt-4 pt-3">
                                        {profile.totalBorrowed && (
                                            <View className="flex-row justify-between mb-2">
                                                <Text className="text-sm text-gray-500">Total Borrowed</Text>
                                                <Text className="text-sm font-medium text-gray-700">
                                                    {profile.totalBorrowed} ETH
                                                </Text>
                                            </View>
                                        )}
                                        {profile.totalRepaid && (
                                            <View className="flex-row justify-between">
                                                <Text className="text-sm text-gray-500">Total Repaid</Text>
                                                <Text className="text-sm font-medium text-gray-700">
                                                    {profile.totalRepaid} ETH
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            )}

            <CustomAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                buttons={alert.buttons}
                icon={alert.icon}
                iconColor={alert.iconColor}
                onClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
            />
        </SafeAreaView>
    );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
    return (
        <View className="mb-3">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
            <View className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-200">
                <Text className="text-sm text-gray-600">{value}</Text>
            </View>
        </View>
    );
}
