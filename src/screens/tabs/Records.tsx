import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useVerificationStore } from "@/stores/verification.store";
import * as loanService from "@/services/loan.service";
import type { Loan, LoanTransaction } from "@/services/loan.service";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PagerView, type PagerViewOnPageSelectedEvent } from "@/components/PagerViewWrapper";

const STATUS_COLORS: Record<string, string> = {
  PENDING_COLLATERAL: "bg-yellow-400",
  COLLATERAL_DEPOSITED: "bg-blue-400",
  ACTIVE: "bg-green-500",
  REPAID: "bg-gray-400",
  LIQUIDATED: "bg-red-500",
  CANCELLED: "bg-gray-300",
  EXPIRED: "bg-orange-400",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_COLLATERAL: "Pending Collateral",
  COLLATERAL_DEPOSITED: "Collateral Deposited",
  ACTIVE: "Active",
  REPAID: "Repaid",
  LIQUIDATED: "Liquidated",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

const STATUS_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING_COLLATERAL: { bg: "bg-yellow-100", text: "text-yellow-700" },
  COLLATERAL_DEPOSITED: { bg: "bg-blue-100", text: "text-blue-700" },
  ACTIVE: { bg: "bg-green-100", text: "text-green-700" },
  REPAID: { bg: "bg-gray-100", text: "text-gray-600" },
  LIQUIDATED: { bg: "bg-red-100", text: "text-red-700" },
  CANCELLED: { bg: "bg-gray-100", text: "text-gray-500" },
  EXPIRED: { bg: "bg-orange-100", text: "text-orange-700" },
};

const TX_TYPE_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }> = {
  COLLATERAL_DEPOSIT: { icon: "arrow-down-circle", label: "Collateral Deposit", color: "#3B82F6" },
  LOAN_DISBURSEMENT: { icon: "wallet", label: "Loan Disbursement", color: "#10B981" },
  REPAYMENT: { icon: "arrow-up-circle", label: "Repayment", color: "#8B5CF6" },
  COLLATERAL_TOPUP: { icon: "add-circle", label: "Collateral Top-up", color: "#3B82F6" },
  COLLATERAL_RETURN: { icon: "return-down-back", label: "Collateral Return", color: "#10B981" },
  LIQUIDATION: { icon: "warning", label: "Liquidation", color: "#EF4444" },
  FEE_PAYMENT: { icon: "receipt", label: "Fee Payment", color: "#F59E0B" },
};

// ─── Loan Detail View ──────────────────────────────────────

function LoanDetailView({
  loan,
  onBack,
}: {
  loan: Loan;
  onBack: () => void;
}) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<LoanTransaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoadingTx(true);
      const result = await loanService.getLoanTransactions(loan.id);
      if (result.success && result.data) {
        setTransactions(result.data);
      }
      setIsLoadingTx(false);
    })();
  }, [loan.id]);

  const badgeStyle = STATUS_BADGE_STYLES[loan.status] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  const totalOwed = (
    parseFloat(loan.principalOwed || "0") +
    parseFloat(loan.interestOwed || "0") +
    parseFloat(loan.feesOwed || "0")
  );

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
        <Text className="text-lg font-bold text-gray-900 ml-3">Loan Details</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Loan Summary Card */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">
              {loan.plan?.name ?? "Loan"}
            </Text>
            <View className={`px-3 py-1 rounded-full ${badgeStyle.bg}`}>
              <Text className={`text-xs font-medium ${badgeStyle.text}`}>
                {STATUS_LABELS[loan.status] ?? loan.status}
              </Text>
            </View>
          </View>

          <Text className="text-3xl font-bold text-gray-900 mb-1">
            {loan.principal} ETH
          </Text>
          <Text className="text-sm text-gray-500 mb-5">
            Applied {new Date(loan.createdAt).toLocaleDateString()}
          </Text>

          {/* Detail Rows */}
          <View className="border-t border-gray-100 pt-4">
            <DetailRow label="Duration" value={`${loan.duration} days`} />
            <DetailRow label="Interest Rate" value={`${loan.interestRate}%`} />
            <DetailRow label="Collateral Required" value={`${loan.collateralRequired} ETH`} />
            <DetailRow label="Collateral Deposited" value={`${loan.collateralDeposited} ETH`} />
            {loan.dueDate && (
              <DetailRow label="Due Date" value={new Date(loan.dueDate).toLocaleDateString()} />
            )}
            {totalOwed > 0 && (
              <DetailRow label="Total Owed" value={`${totalOwed.toFixed(6)} ETH`} bold />
            )}
            {loan.repaidAt && (
              <DetailRow label="Repaid At" value={new Date(loan.repaidAt).toLocaleDateString()} />
            )}
          </View>

          {/* Wallet */}
          <View className="border-t border-gray-100 pt-3 mt-1">
            <Text className="text-xs text-gray-400 mb-1">Wallet</Text>
            <Text className="text-xs text-gray-600 font-mono">
              {loan.wallet?.address ?? "N/A"}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {loan.status === "PENDING_COLLATERAL" && (
          <View className="mx-4 mt-4">
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/collateral-deposit",
                  params: {
                    loanId: loan.id,
                    contractLoanId: String(loan.contractLoanId ?? ""),
                    collateralRequired: loan.collateralRequired,
                    depositAddress: "",
                    loanTitle: loan.plan?.name ?? "Loan",
                  },
                })
              }
              className="bg-gray-900 rounded-2xl py-4 items-center flex-row justify-center"
            >
              <Ionicons name="wallet-outline" size={20} color="#fff" />
              <Text className="text-white font-semibold text-base ml-2">
                Deposit Collateral
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Transaction History */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-5">
          <Text className="text-base font-bold text-gray-900 mb-4">
            Transaction History
          </Text>

          {isLoadingTx ? (
            <View className="py-6 items-center">
              <ActivityIndicator size="small" color="#1F2937" />
            </View>
          ) : transactions.length === 0 ? (
            <View className="py-6 items-center">
              <Ionicons name="receipt-outline" size={32} color="#D1D5DB" />
              <Text className="text-sm text-gray-400 mt-2">
                No transactions yet
              </Text>
            </View>
          ) : (
            <View>
              {transactions.map((tx, index) => {
                const config = TX_TYPE_CONFIG[tx.type] ?? {
                  icon: "ellipse" as const,
                  label: tx.type,
                  color: "#6B7280",
                };
                return (
                  <View
                    key={tx.id}
                    className={`flex-row items-center py-3 ${
                      index < transactions.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <View
                      className="w-9 h-9 rounded-full mr-3 justify-center items-center"
                      style={{ backgroundColor: config.color + "1A" }}
                    >
                      <Ionicons name={config.icon} size={18} color={config.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-900">
                        {config.label}
                      </Text>
                      <Text className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString()}{" "}
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                      {tx.txHash && (
                        <Text className="text-[10px] text-gray-300 mt-0.5" numberOfLines={1}>
                          {tx.txHash}
                        </Text>
                      )}
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-bold text-gray-900">
                        {tx.amount} ETH
                      </Text>
                      {tx.confirmed ? (
                        <Text className="text-[10px] text-green-600">Confirmed</Text>
                      ) : (
                        <Text className="text-[10px] text-yellow-600">Pending</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row justify-between mb-2.5">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className={`text-sm ${bold ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
        {value}
      </Text>
    </View>
  );
}

// ─── Main Records Screen ───────────────────────────────────

export default function DocumentsScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = useRef<any>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const isVerified = useVerificationStore((state) => state.isVerified);
  const router = useRouter();

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
      console.error("[Records] Fetch loans error:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isVerified) fetchLoans();
  }, [isVerified, fetchLoans]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLoans(true);
  };

  // Split loans into active and completed for each tab
  const activeLoans = loans.filter(
    (l) => !["REPAID", "LIQUIDATED", "CANCELLED", "EXPIRED"].includes(l.status)
  );
  const completedLoans = loans.filter((l) =>
    ["REPAID", "LIQUIDATED", "CANCELLED", "EXPIRED"].includes(l.status)
  );

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    pagerRef.current?.setPage(index);
  };

  const handlePageSelected = (e: PagerViewOnPageSelectedEvent) => {
    setActiveTab(e.nativeEvent.position);
  };

  // ─── Detail View ─────────────────────────────────────────

  if (selectedLoan) {
    return (
      <LoanDetailView
        loan={selectedLoan}
        onBack={() => {
          setSelectedLoan(null);
          fetchLoans(true);
        }}
      />
    );
  }

  // ─── Verification Flow ───────────────────────────────────

  const renderVerifyBanner = !isVerified ? (
    <View className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 mx-5 mt-5 flex-row items-center justify-between">
      <View className="flex-1 mr-3">
        <Text className="text-base font-semibold text-gray-900">
          Verify your account
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Verify your account to view your records.
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setShowVerification(true)}
        className="bg-black px-4 py-2 rounded-full"
      >
        <Text className="text-white font-semibold text-sm">Verify</Text>
      </TouchableOpacity>
    </View>
  ) : null;

  if (showVerification) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["right", "bottom", "left"]}>
        <View className="flex-1 bg-white">
          <TouchableOpacity
            onPress={() => setShowVerification(false)}
            className="absolute top-3 right-6 z-10 w-10 h-10 items-center justify-center"
          >
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>

          <View className="flex-1 items-center justify-center px-8">
            <View className="relative mb-12">
              <View className="w-32 h-32 items-center justify-center">
                <View className="absolute top-0 right-0">
                  <View className="bg-orange-400 w-20 h-24 rounded-lg items-center justify-center">
                    <View className="w-12 h-16">
                      <View className="absolute top-2 left-2 w-2 h-12 bg-white rounded-full rotate-45" />
                      <View className="absolute top-4 left-6 w-2 h-10 bg-white rounded-full rotate-45" />
                      <View className="absolute top-6 left-10 w-2 h-8 bg-white rounded-full rotate-45" />
                    </View>
                  </View>
                </View>
                <View className="absolute bottom-0 left-4 w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
                  <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center">
                    <Ionicons name="shield-checkmark" size={24} color="#fff" />
                  </View>
                </View>
              </View>
            </View>

            <Text className="text-2xl font-bold mb-4 text-center">
              Let's get you verified
            </Text>

            <Text className="text-gray-600 text-center leading-6 mb-12">
              To ensure secure access and the proper use of Avaion's features
              and services, we kindly request that you verify your identity.
              This verification is necessary to confirm your authenticity.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/(verification)/BasicInformation")}
              className="bg-black w-full py-4 rounded-full"
            >
              <Text className="text-white font-semibold text-base text-center">
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Loan List Renderer ──────────────────────────────────

  const renderLoanCard = (loan: Loan) => (
    <TouchableOpacity
      key={loan.id}
      onPress={() => setSelectedLoan(loan)}
      className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row items-center"
      activeOpacity={0.7}
    >
      <View className={`w-1 h-16 ${STATUS_COLORS[loan.status] ?? "bg-gray-400"} rounded-full mr-4`} />
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 mb-1">
          {loan.plan?.name ?? "Loan"}
        </Text>
        <Text className="text-xs text-gray-500 mb-1">
          {STATUS_LABELS[loan.status] ?? loan.status} · {new Date(loan.createdAt).toLocaleDateString()}
        </Text>
        <Text className="text-lg font-bold text-gray-900">
          {loan.principal} ETH
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const renderCompletedCard = (loan: Loan) => {
    const isRepaid = loan.status === "REPAID";
    return (
      <TouchableOpacity
        key={loan.id}
        onPress={() => setSelectedLoan(loan)}
        className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row items-center"
        activeOpacity={0.7}
      >
        <View className="w-10 h-10 rounded-full mr-3 justify-center items-center"
          style={{ backgroundColor: isRepaid ? "#D1FAE5" : "#FEE2E2" }}
        >
          <Ionicons
            name={isRepaid ? "checkmark-circle" : "close-circle"}
            size={24}
            color={isRepaid ? "#10B981" : "#EF4444"}
          />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {loan.plan?.name ?? "Loan"}
          </Text>
          <Text className="text-xs text-gray-400">
            {loan.principal} ETH · {STATUS_LABELS[loan.status] ?? loan.status}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-500 mr-1">
            {new Date(loan.createdAt).toLocaleDateString()}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Main Render ─────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["right", "bottom", "left"]}>
      {renderVerifyBanner}

      {/* Tab Navigation (always visible) */}
      <View className="px-5 pt-3 mb-4">
        <View className="flex-row bg-gray-100 rounded-xl p-1">
          <TouchableOpacity
            onPress={() => handleTabPress(0)}
            className={`flex-1 py-3 rounded-lg ${activeTab === 0 ? "bg-white" : "bg-transparent"}`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === 0 ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Loan History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleTabPress(1)}
            className={`flex-1 py-3 rounded-lg ${activeTab === 1 ? "bg-white" : "bg-transparent"}`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === 1 ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isVerified ? (
        <>
          {/* Swipeable Content */}
          <PagerView
            ref={pagerRef}
            style={styles.pagerView}
            initialPage={0}
            onPageSelected={handlePageSelected}
          >
            {/* Active Loans */}
            <View key="1" style={styles.page}>
              {isLoading ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color="#1F2937" />
                </View>
              ) : activeLoans.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                  <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                  <Text className="text-sm text-gray-400 mt-3 text-center">
                    No active loans
                  </Text>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      tintColor="#1F2937"
                    />
                  }
                >
                  <View className="px-5">
                    {activeLoans.map(renderLoanCard)}
                  </View>
                </ScrollView>
              )}
            </View>

            {/* Completed Loans */}
            <View key="2" style={styles.page}>
              {isLoading ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color="#1F2937" />
                </View>
              ) : completedLoans.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                  <Ionicons name="time-outline" size={48} color="#D1D5DB" />
                  <Text className="text-sm text-gray-400 mt-3 text-center">
                    No completed loans yet
                  </Text>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      tintColor="#1F2937"
                    />
                  }
                >
                  <View className="px-5">
                    {completedLoans.map(renderCompletedCard)}
                  </View>
                </ScrollView>
              )}
            </View>
          </PagerView>
        </>
      ) : (
        <View className="px-5 mt-2">
          <View className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-8 items-center justify-center w-full max-w-sm self-center">
            <Text className="text-sm text-gray-700 font-medium text-center">
              No records yet.
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
