import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as notificationsApi from "@/services/notifications-api.service";
import type { Notification } from "@/services/notifications-api.service";

interface NotificationsScreenProps {
    onBack: () => void;
}

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
    LOAN_APPLICATION_RECEIVED: "document-text-outline",
    LOAN_APPROVED: "checkmark-circle-outline",
    LOAN_REJECTED: "close-circle-outline",
    LOAN_DISBURSED: "cash-outline",
    PAYMENT_RECEIVED: "wallet-outline",
    PAYMENT_DUE: "alarm-outline",
    PAYMENT_OVERDUE: "warning-outline",
    KYC_APPROVED: "shield-checkmark-outline",
    KYC_REJECTED: "shield-outline",
};

function getIcon(type: string): keyof typeof Ionicons.glyphMap {
    return ICON_MAP[type] || "notifications-outline";
}

function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default function NotificationsScreen({ onBack }: NotificationsScreenProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const result = await notificationsApi.getNotifications(1, 50);
            if (result.success && result.data) {
                setNotifications(result.data);
                setUnreadCount(result.meta?.unreadCount ?? 0);
            }
        } catch (error) {
            console.error("[Notifications] Fetch error:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchNotifications(true);
    };

    const handlePress = async (notification: Notification) => {
        if (!notification.isRead) {
            await notificationsApi.markAsRead(notification.id);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notification.id ? { ...n, isRead: true } : n,
                ),
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        }
    };

    const handleMarkAllRead = async () => {
        const result = await notificationsApi.markAllAsRead();
        if (result.success) {
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true })),
            );
            setUnreadCount(0);
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            onPress={() => handlePress(item)}
            className={`mx-4 mb-2 p-4 rounded-2xl flex-row items-start ${
                item.isRead ? "bg-white" : "bg-orange-50"
            }`}
        >
            <View
                className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    item.isRead ? "bg-gray-100" : "bg-orange-100"
                }`}
            >
                <Ionicons
                    name={getIcon(item.type)}
                    size={20}
                    color={item.isRead ? "#6B7280" : "#F97316"}
                />
            </View>
            <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                    <Text
                        className={`text-sm flex-1 mr-2 ${
                            item.isRead
                                ? "font-medium text-gray-800"
                                : "font-semibold text-gray-900"
                        }`}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>
                    <Text className="text-xs text-gray-400">
                        {formatTime(item.createdAt)}
                    </Text>
                </View>
                <Text className="text-xs text-gray-500 leading-4" numberOfLines={2}>
                    {item.message}
                </Text>
            </View>
            {!item.isRead && (
                <View className="w-2 h-2 rounded-full bg-orange-500 mt-2 ml-2" />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["right", "bottom", "left"]}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
                <TouchableOpacity
                    onPress={onBack}
                    className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
                >
                    <Ionicons name="arrow-back" size={20} color="#000" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900">Notifications</Text>
                {unreadCount > 0 ? (
                    <TouchableOpacity onPress={handleMarkAllRead}>
                        <Text className="text-sm text-[#FF8C42] font-medium">
                            Read all
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View className="w-10" />
                )}
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#1F2937" />
                </View>
            ) : notifications.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
                    <Text className="text-base font-semibold text-gray-400 mt-4">
                        No notifications yet
                    </Text>
                    <Text className="text-sm text-gray-400 text-center mt-1">
                        You'll see updates about your loans and KYC here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor="#1F2937"
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}
