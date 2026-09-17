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
import { useCollateralGasEstimate } from "@/hooks/useGasEstimate";
import { getWalletErrorMessage } from "@/utils/wallet-errors";
import * as loanService from "@/services/loan.service";

const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;

type AlertState = {
  visible: boolean;
  title: string;
  message?: string;
  buttons: { text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }[];
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
};

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
  // The loan is bound to one wallet; a deposit from any other one reverts
  const [loanWallet, setLoanWallet] = useState<string | null>(null);

  useEffect(() => {
    if (depositAddress) return;
    (async () => {
      const res = await loanService.getBlockchainStatus();
      if (res.success && res.data?.contracts?.collateralManager) {
        setDepositAddress(res.data.contracts.collateralManager);
      }
    })();
  }, [depositAddress]);

  useEffect(() => {
    if (!loanId) return;
    loanService.getLoanById(loanId).then((res) => {
      if (res.success && res.data?.wallet?.address) setLoanWallet(res.data.wallet.address);
    });
  }, [loanId]);

  const { isConnected, address, depositCollateral } = useWalletConnect();
  const wrongWallet = !!(isConnected && address && loanWallet && address.toLowerCase() !== loanWallet.toLowerCase());

  const submit = useCallback((hash: string) => loanService.depositCollateral(loanId, hash), [loanId]);
  const { pending, isRecording, track, record } = useRecordedTransaction("collateral", loanId, submit);

  const [isSigning, setIsSigning] = useState(false);
  const [manualHash, setManualHash] = useState("");
  const [alert, setAlert] = useState<AlertState>({ visible: false, title: "", buttons: [] });

  const gasEstimate = useCollateralGasEstimate({
    collateralManagerAddress: depositAddress || "",
    contractLoanId: Number(contractLoanId) || 0,
    amountEth: collateralRequired || "0",
    from: address,
    enabled: isConnected && !!depositAddress && !!contractLoanId && !pending,
  });

  const showOutcome = (result: Awaited<ReturnType<typeof submit>> & { alreadyRecorded?: boolean }) => {
    if (result.success) {
      const payoutPending = result.data?.payoutPending;
      setAlert({
        visible: true,
        title: payoutPending ? "Stake Received" : "Collateral Deposited",
        message: result.alreadyRecorded
          ? "This deposit was already recorded. Check the loan for its current status."
          : payoutPending
            ? result.message ?? "Your stake is recorded. The payout will arrive as soon as the pool can send it."
            : "Your stake is recorded and your loan is active. The funds are on their way to your wallet.",
        icon: "checkmark-circle",
        iconColor: "#10B981",
        buttons: [{ text: "OK", onPress: () => router.dismissAll() }],
      });
      return;
    }
    setAlert({
      visible: true,
      title: "Not Recorded Yet",
      message: result.error || "The deposit could not be recorded. Try again in a minute.",
      icon: "alert-circle",
      iconColor: "#EF4444",
      buttons: [{ text: "OK" }],
    });
  };

  const handleWalletDeposit = async () => {
    if (!depositAddress || !contractLoanId || !collateralRequired) return;
    if (wrongWallet) {
      setAlert({
        visible: true,
        title: "Different Wallet Connected",
        message: `This loan belongs to ${loanWallet!.slice(0, 8)}…${loanWallet!.slice(-6)}. Switch to that account in your wallet, then try again.`,
        icon: "wallet-outline",
        iconColor: "#F59E0B",
        buttons: [{ text: "OK" }],
      });
      return;
    }

    setIsSigning(true);
    let txHash: string;
    try {
      txHash = await depositCollateral({
        collateralManagerAddress: depositAddress,
        contractLoanId: Number(contractLoanId),
        amountEth: collateralRequired,
      });
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
      return;
    } finally {
      setIsSigning(false);
    }

    showOutcome(await track(txHash));
  };

  const handleManualSubmit = async () => {
    const hash = manualHash.trim();
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
    showOutcome(await record({ hash }));
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
          <Text className="text-xs text-gray-500">Deposit Collateral</Text>
          <Text className="text-base font-bold text-black">{loanTitle || "Loan"}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

        {/* A deposit already signed but not yet on record */}
        {pending && (
          <View className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
            <Text className="text-[13px] text-blue-800 font-semibold mb-1">
              Your deposit is waiting to be recorded
            </Text>
            <Text className="text-[12px] text-blue-700 mb-3" numberOfLines={1}>
              {pending.hash}
            </Text>
            <TouchableOpacity
              onPress={async () => showOutcome(await record(pending))}
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

        {wrongWallet && (
          <View className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-200">
            <Text className="text-[13px] text-yellow-800">
              The connected wallet is not the one this loan uses ({loanWallet!.slice(0, 8)}…{loanWallet!.slice(-6)}). Switch accounts in your wallet before depositing.
            </Text>
          </View>
        )}

        {/* Gas Estimate */}
        {isConnected && !pending && !gasEstimate.isLoading && gasEstimate.estimatedCostEth && (
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

        {gasEstimate.error && isConnected && !pending && !wrongWallet && (
          <View className="bg-red-50 rounded-xl p-4 mb-4 border border-red-200">
            <Text className="text-[13px] text-red-600">
              Gas estimation failed — the transaction may revert. Check your balance and try again.
            </Text>
          </View>
        )}

        {/* One deposit per loan: hide the button while one is being recorded */}
        {isConnected && !pending && (
          <TouchableOpacity
            onPress={handleWalletDeposit}
            disabled={busy}
            className={`rounded-2xl py-4 items-center mb-4 ${busy ? "bg-gray-300" : "bg-gray-900"}`}
          >
            {busy ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white font-semibold text-base ml-2">
                  {isSigning ? "Confirming in Wallet..." : "Recording deposit..."}
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

        {!isConnected && !pending && (
          <View className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-200">
            <Text className="text-[13px] text-yellow-800">
              Connect your verified wallet from the Wallet tab before depositing collateral.
            </Text>
          </View>
        )}

        {/* Already sent from the wallet but the app lost track of it */}
        {!pending && (
          <View className="bg-white rounded-2xl p-5 border border-gray-200">
            <Text className="text-sm font-bold text-gray-900 mb-1">Already sent the deposit?</Text>
            <Text className="text-xs text-gray-500 mb-3">
              Paste its transaction hash from your wallet's activity and we will record it. Do not send a second deposit.
            </Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 border border-gray-200 mb-3"
              placeholder="0x..."
              placeholderTextColor="#9CA3AF"
              value={manualHash}
              onChangeText={setManualHash}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={handleManualSubmit}
              disabled={busy || !manualHash.trim()}
              className={`rounded-full py-3 items-center ${busy || !manualHash.trim() ? "bg-gray-200" : "bg-gray-900"}`}
            >
              <Text className={`text-sm font-semibold ${busy || !manualHash.trim() ? "text-gray-500" : "text-white"}`}>
                Record Deposit
              </Text>
            </TouchableOpacity>
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
