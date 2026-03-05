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
    const [creditScore, setCreditScore] = useState<number | null>(null);
    const [status, setStatus] = useState("");
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
                setName(result.data.name || "");
                setPhone(result.data.phone || "");
                setCreditScore(result.data.creditScore);
                setStatus(result.data.status);
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

    const statusColor = status === "CONNECTED" ? "text-green-600" : status === "APPROVED" ? "text-blue-600" : "text-yellow-600";
    const statusLabel = status === "CONNECTED" ? "Connected" : status === "APPROVED" ? "Approved" : status || "Pending";

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

                        {/* Form */}
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

                        {/* Account Info */}
                        <View className="mx-4 mt-4 bg-white rounded-2xl p-5">
                            <Text className="text-xs font-semibold text-gray-400 uppercase mb-4">
                                Account Info
                            </Text>

                            <View className="flex-row justify-between mb-3">
                                <Text className="text-sm text-gray-500">Status</Text>
                                <Text className={`text-sm font-medium ${statusColor}`}>{statusLabel}</Text>
                            </View>

                            {creditScore !== null && (
                                <View className="flex-row justify-between mb-3">
                                    <Text className="text-sm text-gray-500">Credit Score</Text>
                                    <Text className="text-sm font-bold text-orange-500">{creditScore}</Text>
                                </View>
                            )}
                        </View>
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
