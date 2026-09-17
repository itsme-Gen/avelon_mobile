import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import { useRecordedTransaction } from "@/hooks/useRecordedTransaction";
import { getWalletErrorMessage } from "@/utils/wallet-errors";
import { amountOwed, formatEth } from "@/utils/loan-amounts";
import * as loanService from "@/services/loan.service";

const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;
const AMOUNT_REGEX = /^\d+(\.\d{1,18})?$/;

type AlertState = {
  visible: boolean;
  title: string;
  message?: string;
  buttons: { text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }[];
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
};

export default function LoanRepaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    loanId: string;
    remainingOwed?: string;
    loanTitle?: string;
  }>();
  const { loanId, loanTitle } = params;

  // The server's figure wins over the navigation parameter, which may be stale
  // or missing (a notification tap only carries the loan id).
  const [owed, setOwed] = useState(params.remainingOwed ?? "");
  const [loanStatus, setLoanStatus] = useState<string | null>(null);

  // Repayments go to the liquidity pool, addressed to the on-chain loan id, so the
  // investors who funded it get credited. Both values have to be loaded before the
  // repay button can do anything.
  const [poolAddress, setPoolAddress] = useState("");
  const [contractLoanId, setContractLoanId] = useState<number | null>(null);

  const loadLoan = useCallback(async () => {
    const [status, loan] = await Promise.all([
      loanService.getBlockchainStatus(),
      loanService.getLoanById(loanId),
    ]);
    if (status.success && status.data?.contracts?.liquidityPool) {
      setPoolAddress(status.data.contracts.liquidityPool);
    }
    if (loan.success && loan.data) {
      if (typeof loan.data.contractLoanId === "number") setContractLoanId(loan.data.contractLoanId);
      setOwed(amountOwed(loan.data));
      setLoanStatus(loan.data.status);
    }
  }, [loanId]);

  useEffect(() => {
    loadLoan();
  }, [loadLoan]);

  const nothingOwed = owed === "0";
  const canRepay = !!poolAddress && contractLoanId !== null && !!owed && !nothingOwed && loanStatus === "ACTIVE";
  const { isConnected, repayLoan: walletRepayLoan } = useWalletConnect();

  const submit = useCallback(
    (hash: string, amount?: string) => loanService.repayLoan(loanId, amount ?? "", hash),
    [loanId],
  );
  const { pending, isRecording, track, record } = useRecordedTransaction("repayment", loanId, submit);

  const [isSigning, setIsSigning] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualTxHash, setManualTxHash] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [alert, setAlert] = useState<AlertState>({ visible: false, title: "", buttons: [] });

  useEffect(() => {
    if (!manualAmount && owed && !nothingOwed) setManualAmount(owed);
  }, [owed, nothingOwed, manualAmount]);

  const showOutcome = async (
    result: Awaited<ReturnType<typeof submit>> & { alreadyRecorded?: boolean },
    amount?: string,
  ) => {
    if (result.success) {
      const isFullyRepaid = result.data?.isFullyRepaid ?? false;
      setAlert({
        visible: true,
        title: isFullyRepaid ? "Loan Fully Repaid! 🎉" : "Repayment Recorded",
        message: result.alreadyRecorded
          ? "This payment was already recorded."
          : isFullyRepaid
            ? result.data?.collateralReleasePending
              ? "Your loan is fully repaid. Your stake is being returned and will arrive shortly."
              : "Congratulations! Your loan has been fully repaid and your stake returned."
            : `Repayment of ${amount ?? ""} ETH recorded. Remaining: ${formatEth(result.data?.remainingOwed ?? "0")}.`,
        icon: "checkmark-circle",
        iconColor: "#10B981",
        buttons: [{ text: "OK", onPress: () => router.dismissAll() }],
      });
      return;
    }
    await loadLoan();
    setAlert({
      visible: true,
      title: "Not Recorded Yet",
      message: result.error || "The payment could not be recorded. Try again in a minute.",
      icon: "alert-circle",
      iconColor: "#EF4444",
      buttons: [{ text: "OK" }],
    });
  };

  const handleWalletRepay = async () => {
    if (!canRepay) return;
    const amount = owed;

    setIsSigning(true);
    let txHash: string;
    try {
      txHash = await walletRepayLoan({
        liquidityPoolAddress: poolAddress,
        contractLoanId: contractLoanId!,
        amountEth: amount,
      });
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
      return;
    } finally {
      setIsSigning(false);
    }

    await showOutcome(await track(txHash, amount), amount);
  };

  const handleManualSubmit = async () => {
    const hash = manualTxHash.trim();
    const amount = manualAmount.trim();

    if (!AMOUNT_REGEX.test(amount) || Number(amount) <= 0) {
      setAlert({
        visible: true,
        title: "Invalid Amount",
        message: "Enter the exact amount you sent, e.g. 0.05, with at most 18 decimals.",
        icon: "alert-circle",
        iconColor: "#EF4444",
        buttons: [{ text: "OK" }],
      });
      return;
    }
    if (!TX_HASH_REGEX.test(hash)) {
      setAlert({
        visible: true,
        title: "Invalid Hash",
        message: "Paste the full transaction hash, starting with 0x.",
        icon: "alert-circle",
        iconColor: "#EF4444",
        buttons: [{ text: "OK" }],
      });
      return;
    }

    await showOutcome(await record({ hash, amount }), amount);
  };

  const busy = isSigning || isRecording;

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
        keyboardShouldPersistTaps="handled"
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
          <Text className="text-white text-[28px] font-extrabold leading-tight mb-1">
            {owed ? `${owed} ETH` : "…"}
          </Text>
          <Text className="text-gray-500 text-[11px] mb-3">This exact amount is sent, so the loan closes in one payment.</Text>
          <View className="flex-row items-center">
            <Ionicons name="send-outline" size={14} color="#6B7280" />
            <Text className="text-gray-500 text-xs ml-1" numberOfLines={1}>
              {poolAddress && contractLoanId !== null
                ? `Pool: ${poolAddress.slice(0, 10)}...${poolAddress.slice(-6)} · loan #${contractLoanId}`
                : "Loading repayment details..."}
            </Text>
          </View>
        </View>

        {nothingOwed && (
          <View className="bg-green-50 rounded-xl p-4 mb-4 border border-green-200">
            <Text className="text-[13px] text-green-800">
              Nothing is owed on this loan. Your stake is being returned to your wallet.
            </Text>
          </View>
        )}

        {pending && (
          <View className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
            <Text className="text-[13px] text-blue-800 font-semibold mb-1">
              A payment of {pending.amount} ETH is waiting to be recorded
            </Text>
            <Text className="text-[12px] text-blue-700 mb-3" numberOfLines={1}>
              {pending.hash}
            </Text>
            <TouchableOpacity
              onPress={async () => showOutcome(await record(pending), pending.amount)}
              disabled={busy}
              className={`rounded-full py-3 items-center ${busy ? "bg-gray-300" : "bg-blue-600"}`}
            >
              {busy ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-semibold">Finish Recording</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Repayment instructions */}
        <View className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
          <Text className="text-[13px] text-blue-800 font-semibold mb-1">How to repay</Text>
          <Text className="text-[12px] text-blue-700 leading-5">
            Repayments must call the pool's repay function with your loan id — a plain transfer is not
            recorded against your loan. Use a connected wallet, then paste the transaction hash
            here if the app did not record it automatically.
          </Text>
        </View>

        {/* WalletConnect Repay Button */}
        {isConnected && !showManual && !pending && !nothingOwed && (
          <TouchableOpacity
            onPress={handleWalletRepay}
            disabled={busy || !canRepay}
            className={`rounded-2xl py-4 items-center mb-4 ${busy || !canRepay ? "bg-gray-300" : "bg-gray-900"}`}
          >
            {busy ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white font-semibold text-base ml-2">
                  {isSigning ? "Confirming in Wallet..." : "Recording payment..."}
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="arrow-up-circle-outline" size={20} color="#fff" />
                <Text className="text-white font-semibold text-base ml-2">
                  Repay {owed ? formatEth(owed) : ""} via Wallet
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Not connected message */}
        {!isConnected && !showManual && !nothingOwed && (
          <View className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-200">
            <Text className="text-[13px] text-yellow-800">
              No wallet connected via WalletConnect. Send the repayment from your wallet, then paste the transaction hash below.
            </Text>
          </View>
        )}

        {/* Toggle to manual */}
        {!showManual && !pending && (
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
              Enter the exact amount sent and the transaction hash.
            </Text>

            <Text className="text-xs font-semibold text-gray-600 mb-1">Amount (ETH)</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 border border-gray-200 mb-3"
              placeholder="e.g. 0.05"
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
                disabled={busy}
                className="flex-1 bg-gray-900 rounded-full py-3 items-center"
              >
                {busy ? (
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
