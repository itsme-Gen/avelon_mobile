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
import * as loanService from "@/services/loan.service";
import type { Loan } from "@/services/loan.service";

interface LoanHistoryScreenProps {
    onBack: () => void;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    PENDING_COLLATERAL: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending Collateral" },
    COLLATERAL_DEPOSITED: { bg: "bg-blue-100", text: "text-blue-700", label: "Collateral Deposited" },
    ACTIVE: { bg: "bg-green-100", text: "text-green-700", label: "Active" },
    REPAID: { bg: "bg-gray-100", text: "text-gray-600", label: "Repaid" },
    DEFAULTED: { bg: "bg-red-100", text: "text-red-700", label: "Defaulted" },
    LIQUIDATED: { bg: "bg-red-100", text: "text-red-700", label: "Liquidated" },
};

function getStatusStyle(status: string) {
    return STATUS_STYLES[status] || { bg: "bg-gray-100", text: "text-gray-600", label: status };
}

export default function LoanHistoryScreen({ onBack }: LoanHistoryScreenProps) {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchLoans = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const result = await loanService.getLoans();
            if (result.success && result.data) {
                setLoans(result.data);
            }
        } catch (error) {
            console.error("[LoanHistory] Fetch error:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchLoans(true);
    };

    const renderItem = ({ item }: { item: Loan }) => {
        const style = getStatusStyle(item.status);
        const date = new Date(item.createdAt).toLocaleDateString();

        return (
            <View className="mx-4 mb-3 bg-white rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base font-semibold text-gray-900">
                        {item.amount} ETH
                    </Text>
                    <View className={`px-2.5 py-1 rounded-full ${style.bg}`}>
                        <Text className={`text-xs font-medium ${style.text}`}>
                            {style.label}
                        </Text>
                    </View>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-500">
                        Duration: {item.duration} days
                    </Text>
                    <Text className="text-xs text-gray-500">
                        Rate: {item.interestRate}%
                    </Text>
                </View>
                <View className="flex-row justify-between mt-1">
                    <Text className="text-xs text-gray-400">
                        Collateral: {item.collateralRequired} ETH
                    </Text>
                    <Text className="text-xs text-gray-400">
                        {date}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["right", "bottom", "left"]}>
            {/* Header */}
            <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
                <TouchableOpacity
                    onPress={onBack}
                    className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
                >
                    <Ionicons name="arrow-back" size={20} color="#000" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 ml-3">Loan History</Text>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#1F2937" />
                </View>
            ) : loans.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                    <Text className="text-base font-semibold text-gray-400 mt-4">
                        No loans yet
                    </Text>
                    <Text className="text-sm text-gray-400 text-center mt-1">
                        Your loan applications and history will appear here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={loans}
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
