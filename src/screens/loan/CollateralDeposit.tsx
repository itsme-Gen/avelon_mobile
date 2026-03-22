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
import { useCollateralGasEstimate } from "@/hooks/useGasEstimate";
import { getWalletErrorMessage } from "@/utils/wallet-errors";
import * as loanService from "@/services/loan.service";

const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;

export default function CollateralDepositScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    loanId: string;
    contractLoanId: string;
    collateralRequired: string;
    depositAddress: string;
    loanTitle: string;
  }>();

  const { loanId, contractLoanId, collateralRequired, loanTitle } = params;

  // depositAddress may be empty when navigating from Records; fetch from blockchain status
  const [depositAddress, setDepositAddress] = useState(params.depositAddress || "");

  useEffect(() => {
    if (depositAddress) return;
    (async () => {
      const res = await loanService.getBlockchainStatus();
      if (res.success && res.data?.contracts.collateralManager) {
        setDepositAddress(res.data.contracts.collateralManager);
      }
    })();
  }, [depositAddress]);

  const { isConnected, address, depositCollateral } = useWalletConnect();

  // Manual fallback state
  const [showManual, setShowManual] = useState(false);
  const [manualTxHash, setManualTxHash] = useState("");

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

  // Gas estimation (only when WalletConnect is active)
  const gasEstimate = useCollateralGasEstimate({
    collateralManagerAddress: depositAddress || "",
    contractLoanId: Number(contractLoanId) || 0,
    amountEth: collateralRequired || "0",
    from: address,
    enabled: isConnected && !!depositAddress && !!contractLoanId,
  });

  // Submit collateral deposit to backend after getting txHash
  const submitToBackend = async (txHash: string) => {
    const result = await loanService.depositCollateral(loanId, txHash);
    if (result.success) {
      setAlert({
        visible: true,
        title: "Collateral Deposited",
        message: "Your collateral has been deposited successfully. Your loan is now being activated.",
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
        title: "Verification Failed",
        message: result.error || "Backend could not verify the transaction. Please try again.",
        icon: "alert-circle",
        iconColor: "#EF4444",
        buttons: [{ text: "OK" }],
      });
    }
  };

  // Deposit via WalletConnect
  const handleWalletDeposit = async () => {
    if (!depositAddress || !contractLoanId || !collateralRequired) return;

    setIsSubmitting(true);
    try {
      const txHash = await depositCollateral({
        collateralManagerAddress: depositAddress,
        contractLoanId: Number(contractLoanId),
        amountEth: collateralRequired,
      });

      await submitToBackend(txHash);
    } catch (error) {
      console.error("[CollateralDeposit] WC error:", error);
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

  // Submit manual tx hash
  const handleManualSubmit = async () => {
    const trimmed = manualTxHash.trim();
    if (!TX_HASH_REGEX.test(trimmed)) {
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
      await submitToBackend(trimmed);
    } catch (error) {
      console.error("[CollateralDeposit] Manual submit error:", error);
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
          <Text className="text-xs text-gray-500">Deposit Collateral</Text>
          <Text className="text-base font-bold text-black">{loanTitle || "Loan"}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20, paddingTop: 20 }}
      >
        {/* Loan Details Card */}
        <View
          style={{
            backgroundColor: "#f8893c",
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <Text className="text-[#ffe7d4] text-xs font-semibold uppercase mb-2">
            Collateral Required
          </Text>
          <Text className="text-white text-[28px] font-extrabold leading-tight mb-3">
            {collateralRequired || "0"} ETH
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#ffd7c1" />
            <Text className="text-[#ffd7c1] text-xs ml-1" numberOfLines={1}>
              {depositAddress ? `${depositAddress.slice(0, 10)}...${depositAddress.slice(-6)}` : "--"}
            </Text>
          </View>
        </View>

        {/* Gas Estimate */}
        {isConnected && !gasEstimate.isLoading && gasEstimate.estimatedCostEth && (
          <View className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
            <Text className="text-[11px] font-semibold text-gray-400 uppercase mb-2">
              Estimated Fees
            </Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-[13px] text-gray-600">Gas Fee</Text>
              <Text className="text-[13px] font-medium text-gray-900">
                ~{parseFloat(gasEstimate.estimatedCostEth).toFixed(6)} ETH
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-[13px] text-gray-600">Total Cost</Text>
              <Text className="text-[13px] font-bold text-gray-900">
                ~{gasEstimate.totalCostEth ? parseFloat(gasEstimate.totalCostEth).toFixed(6) : "--"} ETH
              </Text>
            </View>
          </View>
        )}

        {gasEstimate.error && isConnected && (
          <View className="bg-red-50 rounded-xl p-4 mb-4 border border-red-200">
            <Text className="text-[13px] text-red-600">
              Gas estimation failed — the transaction may revert. Check your balance and try again.
            </Text>
          </View>
        )}

        {/* WalletConnect Deposit Button */}
        {isConnected && !showManual && (
          <TouchableOpacity
            onPress={handleWalletDeposit}
            disabled={isSubmitting}
            className={`rounded-2xl py-4 items-center mb-4 ${isSubmitting ? "bg-gray-300" : "bg-gray-900"}`}
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
                <Ionicons name="wallet-outline" size={20} color="#fff" />
                <Text className="text-white font-semibold text-base ml-2">
                  Deposit via Wallet
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Not connected message */}
        {!isConnected && !showManual && (
          <View className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-200">
            <Text className="text-[13px] text-yellow-800">
              No wallet connected via WalletConnect. You can paste a transaction hash manually below.
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
              Send {collateralRequired} ETH to the contract address above, then paste the transaction hash.
            </Text>
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
