import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomAlert } from "@/components/alertbutton/CustomAlert";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { getWalletErrorMessage } from "@/utils/wallet-errors";
import * as loanService from "@/services/loan.service";

const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;
const AMOUNT_REGEX = /^\d+\.?\d*$/;

export default function LoanRepaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    loanId: string;
    remainingOwed: string;
    loanTitle: string;
  }>();

  const { loanId, remainingOwed, loanTitle } = params;

  const [treasuryAddress, setTreasuryAddress] = useState("");

  useEffect(() => {
    (async () => {
      const res = await loanService.getBlockchainStatus();
      if (res.success && res.data?.contracts.treasury) {
        setTreasuryAddress(res.data.contracts.treasury);
      }
    })();
  }, []);

  const { isConnected, repayLoan: walletRepayLoan } = useWalletConnect();

  // Manual fallback state
  const [showManual, setShowManual] = useState(false);
  const [manualTxHash, setManualTxHash] = useState("");
  const [manualAmount, setManualAmount] = useState(remainingOwed ?? "");

  // Transaction state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    buttons: Array<{ text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }>;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
  }>({ visible: false, title: "", buttons: [] });

  const submitToBackend = async (txHash: string, amount: string) => {
    const result = await loanService.repayLoan(loanId, amount, txHash);
    if (result.success) {
      const isFullyRepaid = result.data?.isFullyRepaid ?? false;
      setAlert({
        visible: true,
        title: isFullyRepaid ? "Loan Fully Repaid! 🎉" : "Repayment Recorded",
        message: isFullyRepaid
          ? "Congratulations! Your loan has been fully repaid."
          : `Repayment of ${amount} ETH recorded. Remaining: ${result.data?.remainingOwed ?? "0"} ETH.`,
        icon: "checkmark-circle",
        iconColor: "#10B981",
        buttons: [{
          text: "OK",
          onPress: () => router.dismissAll(),
        }],
      });
    } else {
      setAlert({
        visible: true,
        title: "Repayment Failed",
        message: result.error || "Backend could not verify the transaction. Please try again.",
        icon: "alert-circle",
        iconColor: "#EF4444",
        buttons: [{ text: "OK" }],
      });
    }
  };

  const handleWalletRepay = async () => {
    if (!treasuryAddress || !remainingOwed) return;

    setIsSubmitting(true);
    try {
      const txHash = await walletRepayLoan({
        toAddress: treasuryAddress,
        amountEth: remainingOwed,
      });
      await submitToBackend(txHash, remainingOwed);
    } catch (error) {
      console.error("[LoanRepayment] WC error:", error);
      setAlert({
        visible: true,
        title: "Transaction Failed",
        message: getWalletErrorMessage(error),
        icon: "alert-circle",
        iconColor: "#EF4444",
        buttons: [{ text: "OK" }],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    const trimmedHash = manualTxHash.trim();
    const trimmedAmount = manualAmount.trim();

    if (!AMOUNT_REGEX.test(trimmedAmount) || parseFloat(trimmedAmount) <= 0) {
      setAlert({
        visible: true,
        title: "Invalid Amount",
        message: "Please enter a valid repayment amount.",
        icon: "alert-circle",
        iconColor: "#EF4444",
        buttons: [{ text: "OK" }],
      });
      return;
    }

    if (!TX_HASH_REGEX.test(trimmedHash)) {
      setAlert({
        visible: true,
        title: "Invalid Hash",
        message: "Please enter a valid transaction hash (0x...)",
        icon: "alert-circle",
        iconColor: "#EF4444",
        buttons: [{ text: "OK" }],
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitToBackend(trimmedHash, trimmedAmount);
    } catch (error) {
      console.error("[LoanRepayment] Manual submit error:", error);
      setAlert({
        visible: true,
        title: "Error",
        message: "Something went wrong. Please try again.",
        icon: "alert-circle",
        iconColor: "#EF4444",
        buttons: [{ text: "OK" }],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center absolute left-5 z-10"
        >
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-xs text-gray-500">Make Repayment</Text>
          <Text className="text-base font-bold text-black">{loanTitle || "Loan"}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20, paddingTop: 20 }}
      >
        {/* Remaining Balance Card */}
        <View
          style={{
            backgroundColor: "#1F2937",
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <Text className="text-gray-400 text-xs font-semibold uppercase mb-2">
            Remaining Balance
          </Text>
          <Text className="text-white text-[28px] font-extrabold leading-tight mb-3">
            {remainingOwed || "0"} ETH
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="send-outline" size={14} color="#6B7280" />
            <Text className="text-gray-500 text-xs ml-1" numberOfLines={1}>
              {treasuryAddress
                ? `Send to: ${treasuryAddress.slice(0, 10)}...${treasuryAddress.slice(-6)}`
                : "Loading repayment address..."}
            </Text>
          </View>
        </View>

        {/* Repayment instructions */}
        <View className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
          <Text className="text-[13px] text-blue-800 font-semibold mb-1">How to repay</Text>
          <Text className="text-[12px] text-blue-700 leading-5">
            Send ETH to the treasury address above (via MetaMask or Remix IDE), then paste the transaction hash below to record your repayment.
          </Text>
        </View>

        {/* WalletConnect Repay Button */}
        {isConnected && !showManual && (
          <TouchableOpacity
            onPress={handleWalletRepay}
            disabled={isSubmitting || !treasuryAddress}
            className={`rounded-2xl py-4 items-center mb-4 ${isSubmitting || !treasuryAddress ? "bg-gray-300" : "bg-gray-900"}`}
          >
            {isSubmitting ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white font-semibold text-base ml-2">
                  Confirming in Wallet...
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="arrow-up-circle-outline" size={20} color="#fff" />
                <Text className="text-white font-semibold text-base ml-2">
                  Repay via Wallet ({remainingOwed} ETH)
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Not connected message */}
        {!isConnected && !showManual && (
          <View className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-200">
            <Text className="text-[13px] text-yellow-800">
              No wallet connected via WalletConnect. Send ETH manually then paste the transaction hash below.
            </Text>
          </View>
        )}

        {/* Toggle to manual */}
        {!showManual && (
          <TouchableOpacity
            onPress={() => setShowManual(true)}
            className="items-center py-2"
          >
            <Text className="text-gray-500 text-xs underline">
              Already sent? Paste transaction hash
            </Text>
          </TouchableOpacity>
        )}

        {/* Manual tx hash input */}
        {showManual && (
          <View className="bg-white rounded-2xl p-5 border border-gray-200">
            <Text className="text-base font-bold text-gray-900 mb-1">
              Manual Submission
            </Text>
            <Text className="text-sm text-gray-500 mb-3">
              Enter the amount sent and the transaction hash.
            </Text>

            <Text className="text-xs font-semibold text-gray-600 mb-1">Amount (ETH)</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 border border-gray-200 mb-3"
              placeholder="e.g. 0.012"
              placeholderTextColor="#9CA3AF"
              value={manualAmount}
              onChangeText={setManualAmount}
              keyboardType="decimal-pad"
              autoCorrect={false}
            />

            <Text className="text-xs font-semibold text-gray-600 mb-1">Transaction Hash</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 border border-gray-200 mb-3"
              placeholder="0x..."
              placeholderTextColor="#9CA3AF"
              value={manualTxHash}
              onChangeText={setManualTxHash}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => { setShowManual(false); setManualTxHash(""); }}
                className="flex-1 bg-gray-100 rounded-full py-3 items-center"
              >
                <Text className="text-sm font-semibold text-gray-700">Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleManualSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gray-900 rounded-full py-3 items-center"
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-sm font-semibold text-white">Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

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
