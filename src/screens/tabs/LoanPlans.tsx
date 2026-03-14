import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useVerificationStore } from "@/stores/verification.store";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomAlert } from "../../components/alertbutton/CustomAlert";
import * as loanService from "@/services/loan.service";
import type { LoanPlan } from "@/services/loan.service";

export default function LoanPlans() {
  const router = useRouter();
  const [showVerification, setShowVerification] = useState(false);
  const isVerified = useVerificationStore((state) => state.isVerified);
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }>;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
  }>({
    visible: false,
    title: "",
    buttons: [],
  });

  const [plans, setPlans] = useState<LoanPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const PLAN_COLORS = [
    "bg-gray-400", "bg-red-500", "bg-blue-500",
    "bg-purple-500", "bg-orange-500", "bg-teal-500",
  ];

  const fetchPlans = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const result = await loanService.getLoanPlans();
      if (result.success && result.data) {
        setPlans(result.data);
      }
    } catch (error) {
      console.error('[LoanPlans] Fetch error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPlans(true);
  };

  useEffect(() => {
    if (isVerified) {
      fetchPlans();
    }
  }, [isVerified, fetchPlans]);

  const handleLoanPress = (plan: LoanPlan) => {
    if (!isVerified) {
      setAlert({
        visible: true,
        title: "Account verification required",
        message: "Please verify your account first to apply for a loan.",
        icon: "shield-checkmark",
        iconColor: "#0f172a",
        buttons: [
          {
            text: "Verify now",
            onPress: () => setShowVerification(true),
          },
          {
            text: "Maybe later",
            style: "cancel",
          },
        ],
      });
      return;
    }

    router.push({
      pathname: "/loan-application",
      params: {
        planId: plan.id,
        title: plan.name,
        amount: `${plan.maxAmount} ETH`,
        interest: `${plan.interestRate}%`,
        duration: String(plan.durationOptions[0] || 30),
      },
    });
  };

  const renderVerifyBanner = !isVerified ? (
    <View className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-5 flex-row items-center justify-between">
      <View className="flex-1 mr-3">
        <Text className="text-base font-semibold text-gray-900">
          Verify your account
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Verify your account now to see loan plans.
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

  const closeAlert = () =>
    setAlert((prev) => ({
      ...prev,
      visible: false,
    }));

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
    <SafeAreaView className="flex-1 bg-white" edges={["right", "bottom", "left"]}>
      <ScrollView
        className="flex-1 mt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Content */}
        <View className="px-5">
          {renderVerifyBanner}

          <Text className="text-lg font-semibold text-black mb-6">
            Available loans for you
          </Text>

          {/* Loan Cards */}
          {isVerified ? (
            isLoading ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#1F2937" />
                <Text className="text-sm text-gray-500 mt-3">Loading plans...</Text>
              </View>
            ) : plans.length > 0 ? (
              <View>
                {plans.map((plan, index) => (
                  <TouchableOpacity
                    key={plan.id}
                    className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row items-center"
                    onPress={() => handleLoanPress(plan)}
                  >
                    <View className={`w-1 h-16 ${PLAN_COLORS[index % PLAN_COLORS.length]} rounded-full mr-4`} />
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 mb-1">
                        {plan.name}
                      </Text>
                      <Text className="text-xs text-gray-500 mb-2">
                        {plan.interestRate}% Interest · {plan.durationOptions[0]}–{plan.durationOptions[plan.durationOptions.length - 1]} days
                      </Text>
                      <Text className="text-lg font-bold text-gray-900">
                        {plan.minAmount}–{plan.maxAmount} ETH
                      </Text>
                    </View>
                    <View className="w-10 h-10 rounded-full bg-gray-900 justify-center items-center">
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="bg-gray-50 border border-gray-200 rounded-2xl p-6 items-center">
                <Text className="text-sm text-gray-500 text-center">
                  No loan plans available at the moment.
                </Text>
                <TouchableOpacity onPress={fetchPlans} className="mt-3">
                  <Text className="text-sm text-[#FF8C42] font-medium">Refresh</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <View className="bg-gray-50 border border-gray-200 rounded-2xl p-4 items-center justify-center">
              <Text className="text-sm text-gray-700 font-medium text-center">
                Verify your account to see available loans.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onClose={closeAlert}
        icon={alert.icon}
        iconColor={alert.iconColor}
      />
    </SafeAreaView>
  );
}
