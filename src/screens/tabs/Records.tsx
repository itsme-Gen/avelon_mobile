import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useVerificationStore } from "@/stores/verification.store";
import * as loanService from "@/services/loan.service";
import type { Loan } from "@/services/loan.service";
import {
  useWalletConnection,
  useDepositCollateral,
  useRepayLoan,
} from "@/services/web3.service";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

export default function DocumentsScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = useRef<any>(null);
  const [showVerification, setShowVerification] = useState(false);
  const isVerified = useVerificationStore((state) => state.isVerified);
  const router = useRouter();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  type ActionType = 'deposit' | 'repay';
  const [actionModal, setActionModal] = useState<{
    visible: boolean;
    type: ActionType;
    loan: Loan | null;
  }>({ visible: false, type: 'deposit', loan: null });
  const [repayAmountInput, setRepayAmountInput] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { open, isConnected } = useWalletConnection();

  // Tracks whether the user tapped "Connect Wallet" so we can re-open the
  // action modal automatically once WalletConnect finishes connecting.
  const pendingConnectRef = useRef<{ type: ActionType; loan: Loan } | null>(null);

  useEffect(() => {
    if (isConnected && pendingConnectRef.current) {
      const { type, loan } = pendingConnectRef.current;
      pendingConnectRef.current = null;
      setActionError(null);
      setActionModal({ visible: true, type, loan });
    }
  }, [isConnected]);

  const { deposit } = useDepositCollateral();
  const { repay } = useRepayLoan();

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

  // Re-fetch silently whenever this tab comes back into focus
  // (catches loans created on other screens without requiring a manual pull-to-refresh)
  useFocusEffect(
    useCallback(() => {
      if (isVerified) fetchLoans(true);
    }, [isVerified, fetchLoans])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLoans(true);
  };

  const handleOpenDeposit = (loan: Loan) => {
    setActionError(null);
    setActionModal({ visible: true, type: 'deposit', loan });
  };

  const handleOpenRepay = (loan: Loan) => {
    setRepayAmountInput('');
    setActionError(null);
    setActionModal({ visible: true, type: 'repay', loan });
  };

  const handleCloseModal = () => {
    pendingConnectRef.current = null;
    setActionModal((prev) => ({ ...prev, visible: false }));
  };

  const handleConfirmAction = async () => {
    const { type, loan } = actionModal;
    if (!loan) return;

    if (!isConnected) {
      // Close the deposit/repay modal first — Android can't stack two native Modals.
      // Once isConnected becomes true, the useEffect above re-opens this modal.
      pendingConnectRef.current = { type, loan };
      setActionModal({ visible: false, type, loan: null });
      open();
      return;
    }

    setIsActioning(true);
    setActionError(null);

    try {
      if (type === 'deposit') {
        if (loan.contractLoanId == null) {
          setActionError('Loan not synced to blockchain yet. Please wait and try again.');
          return;
        }
        const txHash = await deposit(loan.contractLoanId, loan.collateralRequired);
        const result = await loanService.depositCollateral(loan.id, txHash);
        if (result.success) {
          setActionModal({ visible: false, type: 'deposit', loan: null });
          fetchLoans(true);
        } else {
          setActionError(result.error ?? 'Failed to confirm deposit.');
        }
      } else {
        if (!repayAmountInput.trim()) {
          setActionError('Please enter the repayment amount.');
          return;
        }
        const txHash = await repay(repayAmountInput.trim());
        const result = await loanService.repayLoan(loan.id, repayAmountInput.trim(), txHash);
        if (result.success) {
          setActionModal({ visible: false, type: 'deposit', loan: null });
          fetchLoans(true);
        } else {
          setActionError(result.error ?? 'Failed to confirm repayment.');
        }
      }
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (err?.code === 4001 || msg.includes('rejected') || msg.includes('denied') || msg.includes('cancelled')) {
        setActionError('Transaction cancelled.');
      } else if (msg.includes('insufficient')) {
        setActionError('Insufficient funds in your wallet.');
      } else if (msg.includes('switch') || msg.includes('chain')) {
        setActionError('Please switch to Sepolia testnet and try again.');
      } else {
        setActionError(msg || 'Wallet transaction failed. Please try again.');
      }
    } finally {
      setIsActioning(false);
    }
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

  return (
    <>
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
                    {activeLoans.map((loan) => (
                      <View
                        key={loan.id}
                        className="bg-gray-50 rounded-2xl p-4 mb-3"
                      >
                        <View className="flex-row items-center">
                          <View className={`w-1 h-16 ${STATUS_COLORS[loan.status] ?? "bg-gray-400"} rounded-full mr-4`} />
                          <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1">
                              <Text className="text-base font-semibold text-gray-900">
                                {loan.plan?.name ?? "Loan"}
                              </Text>
                              {loan.contractLoanId != null && (
                                <View className="bg-orange-100 rounded px-1.5 py-0.5">
                                  <Text className="text-orange-600 font-bold text-xs">#{loan.contractLoanId}</Text>
                                </View>
                              )}
                            </View>
                            <Text className="text-xs text-gray-500 mb-1">
                              {STATUS_LABELS[loan.status] ?? loan.status} · {new Date(loan.createdAt).toLocaleDateString()}
                            </Text>
                            <Text className="text-lg font-bold text-gray-900">
                              {loan.principal} ETH
                            </Text>
                          </View>
                        </View>
                        {loan.status === "PENDING_COLLATERAL" && (
                          <TouchableOpacity
                            onPress={() => handleOpenDeposit(loan)}
                            className="mt-3 bg-yellow-400 rounded-xl py-2 items-center"
                          >
                            <Text className="text-black font-semibold text-sm">Deposit Collateral</Text>
                          </TouchableOpacity>
                        )}
                        {loan.status === "ACTIVE" && (
                          <TouchableOpacity
                            onPress={() => handleOpenRepay(loan)}
                            className="mt-3 bg-gray-900 rounded-xl py-2 items-center"
                          >
                            <Text className="text-white font-semibold text-sm">Repay Loan</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>

            {/* Loan History (completed) */}
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
                    {completedLoans.map((loan) => {
                      const isRepaid = loan.status === "REPAID";
                      return (
                        <TouchableOpacity
                          key={loan.id}
                          className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row items-center"
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
                            <View className="flex-row items-center gap-2 mb-1">
                              <Text className="text-base font-semibold text-gray-900">
                                {loan.plan?.name ?? "Loan"}
                              </Text>
                              {loan.contractLoanId != null && (
                                <View className="bg-orange-100 rounded px-1.5 py-0.5">
                                  <Text className="text-orange-600 font-bold text-xs">#{loan.contractLoanId}</Text>
                                </View>
                              )}
                            </View>
                            <Text className="text-xs text-gray-400">
                              {loan.principal} ETH · {STATUS_LABELS[loan.status] ?? loan.status}
                            </Text>
                          </View>
                          <Text className="text-sm text-gray-500">
                            {new Date(loan.createdAt).toLocaleDateString()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
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

      {/* Loan Action Modal — Deposit Collateral / Repay Loan */}
      <Modal
        visible={actionModal.visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
            <TouchableOpacity
              onPress={handleCloseModal}
              className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
            >
              <Ionicons name="close" size={20} color="#000" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-black ml-3">
              {actionModal.type === 'deposit' ? 'Deposit Collateral' : 'Repay Loan'}
            </Text>
          </View>

          <ScrollView className="flex-1 px-5 pt-5" contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Wallet connection status */}
            <View className={`rounded-xl p-3 mb-5 flex-row items-center gap-2 ${isConnected ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
              <View className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <Text className={`text-xs font-medium ${isConnected ? 'text-green-700' : 'text-gray-500'}`}>
                {isConnected ? 'Wallet connected · Sepolia testnet' : 'No wallet connected — tap Confirm to connect'}
              </Text>
            </View>

            {/* Deposit Collateral info */}
            {actionModal.loan && actionModal.type === 'deposit' && (
              <>
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1">Amount to Send</Text>
                  <Text className="text-2xl font-bold text-gray-900">
                    {actionModal.loan.collateralRequired} ETH
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">on Sepolia testnet</Text>
                </View>

                {actionModal.loan.contractLoanId != null && (
                  <View className="mb-5 bg-gray-50 rounded-xl p-3">
                    <Text className="text-xs text-gray-500 mb-1">On-chain Loan ID</Text>
                    <Text className="text-lg font-bold text-gray-900">#{actionModal.loan.contractLoanId}</Text>
                  </View>
                )}
              </>
            )}

            {/* Repay Loan info */}
            {actionModal.loan && actionModal.type === 'repay' && (
              <>
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1">Principal</Text>
                  <Text className="text-base font-bold text-gray-900">
                    {actionModal.loan.principal} ETH
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1">Remaining Owed (approx.)</Text>
                  <Text className="text-base font-semibold text-gray-700">
                    {parseFloat(actionModal.loan.principalOwed ?? actionModal.loan.principal).toFixed(6)} ETH
                  </Text>
                </View>

                <View className="mb-5">
                  <Text className="text-xs font-semibold text-gray-700 mb-1">Repayment Amount (ETH)</Text>
                  <View className="border border-gray-200 rounded-xl px-4 py-3">
                    <TextInput
                      value={repayAmountInput}
                      onChangeText={setRepayAmountInput}
                      placeholder="e.g. 0.05"
                      placeholderTextColor="#C0C0C0"
                      keyboardType="decimal-pad"
                      className="text-sm text-gray-900"
                    />
                  </View>
                </View>
              </>
            )}

            {actionError && (
              <Text className="text-sm text-red-500 mb-4">{actionError}</Text>
            )}

            <TouchableOpacity
              onPress={handleConfirmAction}
              disabled={isActioning}
              className={`rounded-2xl py-4 items-center ${isActioning ? 'bg-gray-300' : 'bg-gray-900'}`}
            >
              {isActioning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  {!isConnected
                    ? 'Connect Wallet'
                    : actionModal.type === 'deposit'
                    ? 'Confirm Deposit on Sepolia'
                    : 'Confirm Repayment on Sepolia'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
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
