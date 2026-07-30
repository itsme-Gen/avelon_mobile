import { TermsModal } from "@/components/terms/TermsModal";
import type { LoanPlan } from "@/services/loan.service";
import * as loanService from "@/services/loan.service";
import { useVerificationStore } from "@/stores/verification.store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type InfoModalState = {
  visible: boolean;
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  actionLabel?: string;
  onAction?: () => void;
};

const InfoModal = ({
  state,
  onClose,
}: {
  state: InfoModalState;
  onClose: () => void;
}) => (
  <Modal
    transparent
    visible={state.visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View className="flex-1 bg-black/50 items-center justify-center px-5">
      <View className="w-full bg-white rounded-3xl p-5">
        <View className="items-center mb-4">
          {state.icon ? (
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: "#F3F4F6" }}
            >
              <Ionicons
                name={state.icon}
                size={28}
                color={state.iconColor || "#111827"}
              />
            </View>
          ) : null}
          <Text className="text-base font-semibold text-gray-900 mt-3 text-center">
            {state.title}
          </Text>
          {state.message ? (
            <Text className="text-sm text-gray-600 mt-2 text-center leading-5">
              {state.message}
            </Text>
          ) : null}
        </View>

        {state.onAction && state.actionLabel ? (
          <TouchableOpacity
            onPress={() => {
              state.onAction?.();
              onClose();
            }}
            className="bg-black w-full py-4 rounded-full items-center"
          >
            <Text className="text-white font-semibold text-base">
              {state.actionLabel}
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          onPress={onClose}
          className="w-full py-4 rounded-full items-center mt-2 border border-gray-200"
        >
          <Text className="text-base font-semibold text-gray-800">Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const TERMS_ITEMS = [
  "To use our services, you must be at least 18 years old and have a valid bank account.",
  "To apply for a loan, you must provide accurate and complete information and consent to our verification of the provided information.",
  "We will review your application and notify you of our decision within 2 business days. If approved, we will provide the loan amount to your bank account.",
  "You agree to repay the loan amount along with any applicable interest and fees according to the repayment schedule provided. Late payments may result in additional charges.",
  "We may charge fees for processing your loan application, late payments, and other services, as disclosed before you agree to the loan terms.",
  "We respect your privacy and will protect your information. We will not share your personal information with third parties without your consent, except as required by law.",
  "We reserve the right to terminate your access to our services if you violate these Terms and Conditions or engage in fraudulent activities.",
  "We uphold fair access to our services regardless of race, gender, disability, or other personal traits, in line with Philippine laws.",
];

const AMOUNT_DECIMALS = 6;
const MIN_AMOUNT_STEP = 0.0001;

const formatLoanAmount = (value: number) =>
  Number(value).toFixed(AMOUNT_DECIMALS);

const getAmountStep = (plan: LoanPlan) =>
  Math.max(
    Number((plan.maxAmount * 0.01).toFixed(AMOUNT_DECIMALS)),
    MIN_AMOUNT_STEP,
  );

const clampAmount = (plan: LoanPlan, value: number) =>
  Math.min(plan.maxAmount, Math.max(plan.minAmount, value));

const snapAmountToStep = (plan: LoanPlan, value: number) => {
  const step = getAmountStep(plan);
  const clamped = clampAmount(plan, value);
  const snapped =
    plan.minAmount + Math.round((clamped - plan.minAmount) / step) * step;

  return Number(clampAmount(plan, snapped).toFixed(AMOUNT_DECIMALS));
};

const sanitizeAmountInput = (value: string) => {
  const allowed = value.replace(/[^0-9.]/g, "");

  if (!allowed) {
    return "";
  }

  const firstDotIndex = allowed.indexOf(".");

  if (firstDotIndex === -1) {
    return allowed;
  }

  const whole = allowed.slice(0, firstDotIndex) || "0";
  const decimal = allowed
    .slice(firstDotIndex + 1)
    .replace(/\./g, "")
    .slice(0, AMOUNT_DECIMALS);

  return `${whole}.${decimal}`;
};

const parseAmountDraft = (plan: LoanPlan, draft?: string) => {
  const parsed = Number(draft);

  if (!Number.isFinite(parsed)) {
    return plan.minAmount;
  }

  return clampAmount(plan, parsed);
};

export default function LoanPlans() {
  const router = useRouter();
  const { isVerified } = useVerificationStore();

  const [plans, setPlans] = useState<LoanPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDurationByPlan, setSelectedDurationByPlan] = useState<
    Record<string, number | null>
  >({});
  const [selectedAmountDraftByPlan, setSelectedAmountDraftByPlan] = useState<
    Record<string, string>
  >({});
  const [agreedTermsByPlan, setAgreedTermsByPlan] = useState<
    Record<string, boolean>
  >({});
  const [termsModalPlanId, setTermsModalPlanId] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [focusedAmountPlanId, setFocusedAmountPlanId] = useState<string | null>(
    null,
  );
  const [infoModal, setInfoModal] = useState<InfoModalState>({
    visible: false,
    title: "",
  });

  const formatEth = (value?: number) => `${Number(value ?? 0).toFixed(6)} ETH`;

  const getSelectedAmount = (plan: LoanPlan) =>
    parseAmountDraft(plan, selectedAmountDraftByPlan[plan.id]);

  const updateAmountDraft = (planId: string, nextValue: string) => {
    setSelectedAmountDraftByPlan((prev) => ({
      ...prev,
      [planId]: nextValue,
    }));
  };

  const commitAmountDraft = (plan: LoanPlan) => {
    const committed = snapAmountToStep(
      plan,
      parseAmountDraft(plan, selectedAmountDraftByPlan[plan.id]),
    );

    updateAmountDraft(plan.id, formatLoanAmount(committed));
  };

  const changeAmountByStep = (plan: LoanPlan, delta: number) => {
    const currentAmount = parseAmountDraft(plan, selectedAmountDraftByPlan[plan.id]);
    const nextAmount = snapAmountToStep(plan, currentAmount + delta);

    updateAmountDraft(plan.id, formatLoanAmount(nextAmount));
  };

  const formatDurationLabel = (days: number) => {
    if (days % 30 === 0) {
      const months = days / 30;
      return `${months} month${months === 1 ? "" : "s"}`;
    }
    return `${days} days`;
  };

  const buildSchedulePreview = (
    plan: LoanPlan,
    amount: number,
    durationDays: number,
  ) => {
    const monthsCount = Math.max(1, Math.round(durationDays / 30));
    const intervalDays = Math.max(1, Math.round(durationDays / monthsCount));
    const totalWithInterest = amount * (1 + plan.interestRate / 100);
    const installment = totalWithInterest / monthsCount;

    return Array.from({ length: monthsCount }).map((_, index) => {
      const days = intervalDays * (index + 1);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + days);

      return {
        label: `Period ${index + 1}/${monthsCount}`,
        amount: `${installment.toFixed(6)} ETH`,
        due: `Repayment due date: ${dueDate.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })}`,
        dueMonth: dueDate.toLocaleDateString("en-US", { month: "long" }),
      };
    });
  };

  const fetchPlans = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const result = await loanService.getLoanPlans();
      if (result.success && result.data) {
        const starterOnly = result.data.filter((plan) =>
          plan.name.toLowerCase().includes("starter"),
        );
        const usablePlans = starterOnly.length
          ? starterOnly
          : result.data.slice(0, 1);
        setPlans(usablePlans);
      }
    } catch (error) {
      console.error("[LoanPlans] Fetch error:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPlans(true);
  };

  const handleSchedulePress = (
    plan: LoanPlan,
    entry: {
      label: string;
      amount: string;
      due: string;
      dueMonth: string;
    },
  ) => {
    setInfoModal({
      visible: true,
      title: `${entry.label} repayment`,
      message: `${plan.name}\n${entry.amount}\nMonth: ${entry.dueMonth}\n${entry.due}`,
      icon: "calendar-outline",
      iconColor: "#111827",
    });
  };

  useEffect(() => {
    if (isVerified) {
      fetchPlans();
    }
  }, [isVerified, fetchPlans]);

  useEffect(() => {
    if (!plans.length) return;

    setSelectedAmountDraftByPlan((prev) => {
      const next = { ...prev };
      plans.forEach((plan) => {
        if (next[plan.id] == null) {
          next[plan.id] = formatLoanAmount(plan.minAmount || 0);
        }
      });
      return next;
    });

    setAgreedTermsByPlan((prev) => {
      const next = { ...prev };
      plans.forEach((plan) => {
        if (next[plan.id] == null) {
          next[plan.id] = false;
        }
      });
      return next;
    });

    setSelectedDurationByPlan((prev) => {
      const next = { ...prev };
      plans.forEach((plan) => {
        if (next[plan.id] == null) {
          next[plan.id] = null;
        }
      });
      return next;
    });
  }, [plans]);

  const handleLoanPress = (plan: LoanPlan) => {
    const chosenDuration = selectedDurationByPlan[plan.id];
    const chosenAmount = getSelectedAmount(plan);

    if (!isVerified) {
      setInfoModal({
        visible: true,
        title: "Account verification required",
        message: "Please verify your account first to apply for a loan.",
        icon: "shield-checkmark",
        iconColor: "#0f172a",
        actionLabel: "Verify now",
        onAction: () => setShowVerification(true),
      });
      return;
    }

    if (!chosenDuration) {
      setInfoModal({
        visible: true,
        title: "Select a frequency",
        message: "Please choose a repayment frequency before applying.",
      });
      return;
    }

    if (!agreedTermsByPlan[plan.id]) {
      setTermsModalPlanId(plan.id);
      return;
    }

    router.push({
      pathname: "/loan-application",
      params: {
        planId: plan.id,
        title: plan.name,
        amount: `${Number(chosenAmount).toFixed(6)} ETH`,
        interest: `${plan.interestRate}%`,
        duration: String(chosenDuration),
      },
    });
  };

  const toggleTerms = (planId: string) => {
    setAgreedTermsByPlan((prev) => ({ ...prev, [planId]: !prev[planId] }));
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

  const closeInfoModal = () =>
    setInfoModal((prev) => ({
      ...prev,
      visible: false,
    }));

  if (showVerification) {
    return (
      <SafeAreaView
        className="flex-1 bg-white"
        edges={["right", "bottom", "left"]}
      >
        <View className="flex-1 bg-white">
          <TouchableOpacity
            onPress={() => setShowVerification(false)}
            className="absolute top-3 right-6 z-10 w-10 h-10 items-center justify-center"
          >
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>

          <View className="flex-1 items-center justify-center px-8">
            <View className="w-32 h-32 mb-12 rounded-full bg-blue-100 items-center justify-center">
              <View className="w-20 h-20 rounded-full bg-blue-500 items-center justify-center">
                <Ionicons name="shield-checkmark" size={36} color="#fff" />
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
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["right", "bottom", "left"]}
    >
      <ScrollView
        className="flex-1 mt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="px-5">
          {renderVerifyBanner}

          <Text className="text-lg font-semibold text-black mb-6">
            Available loans for you
          </Text>

          {isVerified ? (
            isLoading ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#1F2937" />
                <Text className="text-sm text-gray-500 mt-3">
                  Loading plans...
                </Text>
              </View>
            ) : plans.length > 0 ? (
              <View>
                {plans.map((plan) => {
                  const selectedDuration = selectedDurationByPlan[plan.id];
                  const selectedAmount = getSelectedAmount(plan);
                  const schedulePreview = selectedDuration
                    ? buildSchedulePreview(
                        plan,
                        selectedAmount,
                        selectedDuration,
                      )
                    : [];
                  const monthsLabel = selectedDuration
                    ? formatDurationLabel(selectedDuration)
                    : "";
                  const hasAgreed = Boolean(agreedTermsByPlan[plan.id]);
                  const hasDuration = selectedDuration != null;

                  return (
                    <View
                      key={plan.id}
                      className="bg-white border border-gray-100 rounded-3xl p-5 mb-6 shadow-sm"
                    >
                      <View className="flex-row items-center justify-between mb-4">
                        <View>
                          <Text className="text-xs uppercase tracking-wide text-gray-500">
                            {plan.interestType === "FLAT"
                              ? "Flat rate"
                              : "Compound rate"}
                          </Text>
                          <Text className="text-lg font-semibold text-gray-900">
                            {plan.name}
                          </Text>
                        </View>
                        <View className="bg-gray-900 rounded-full px-3 py-1">
                          <Text className="text-white text-xs font-semibold">
                            {plan.interestRate}%
                          </Text>
                        </View>
                      </View>

                      <View className="bg-white border border-gray-200 rounded-3xl px-4 py-5 mb-4">
                        <View className="flex-row items-start justify-between mb-3">
                          <View className="flex-1 pr-3">
                            <Text className="text-xs uppercase tracking-wide text-gray-500">
                              Borrow amount
                            </Text>
                            <Text className="text-2xl font-bold text-gray-900 mt-1">
                              {formatEth(selectedAmount)}
                            </Text>
                          </View>

                          <View className="items-end">
                            <Text className="text-[11px] text-gray-500">
                              Min {formatEth(plan.minAmount)}
                            </Text>
                            <Text className="text-[11px] text-gray-500 mt-1">
                              Max {formatEth(plan.maxAmount)}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row items-center">
                          <TouchableOpacity
                            onPress={() =>
                              changeAmountByStep(plan, -getAmountStep(plan))
                            }
                            className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center"
                          >
                            <Ionicons name="remove" size={20} color="#111827" />
                          </TouchableOpacity>

                          <View
                            className={`flex-1 mx-3 rounded-3xl border px-4 py-3 ${focusedAmountPlanId === plan.id ? "border-gray-900 bg-white" : "border-gray-200 bg-gray-50"}`}
                          >
                            <Text className="text-[11px] uppercase tracking-wide text-gray-500">
                              Enter amount
                            </Text>
                            <View className="flex-row items-center justify-between mt-1">
                              <TextInput
                                value={
                                  selectedAmountDraftByPlan[plan.id] ??
                                  formatLoanAmount(plan.minAmount)
                                }
                                onChangeText={(text) =>
                                  updateAmountDraft(
                                    plan.id,
                                    sanitizeAmountInput(text),
                                  )
                                }
                                onFocus={() => {
                                  setFocusedAmountPlanId(plan.id);
                                  if (!selectedAmountDraftByPlan[plan.id]) {
                                    updateAmountDraft(
                                      plan.id,
                                      formatLoanAmount(plan.minAmount),
                                    );
                                  }
                                }}
                                onBlur={() => {
                                  setFocusedAmountPlanId((current) =>
                                    current === plan.id ? null : current,
                                  );
                                  commitAmountDraft(plan);
                                }}
                                keyboardType="decimal-pad"
                                returnKeyType="done"
                                placeholder="0.000000"
                                placeholderTextColor="#9CA3AF"
                                selectTextOnFocus
                                className="flex-1 text-xl font-semibold text-gray-900 py-0"
                              />
                              <Text className="text-sm font-semibold text-gray-500 ml-3">
                                ETH
                              </Text>
                            </View>
                          </View>

                          <TouchableOpacity
                            onPress={() =>
                              changeAmountByStep(plan, getAmountStep(plan))
                            }
                            className="w-12 h-12 rounded-full bg-[#FF8C42] items-center justify-center"
                          >
                            <Ionicons name="add" size={20} color="#fff" />
                          </TouchableOpacity>
                        </View>

                        <Text className="text-[11px] text-gray-500 mt-3 leading-4">
                          Step {formatEth(getAmountStep(plan))} increments. Values outside the range are clamped when you leave the field.
                        </Text>
                      </View>

                      <View className="mb-4">
                        <Text className="text-sm font-semibold text-gray-900 mb-2">
                          Frequency
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                          {(plan.durationOptions ?? []).map((duration) => {
                            const isActive = duration === selectedDuration;
                            const label = formatDurationLabel(duration);

                            return (
                              <TouchableOpacity
                                key={`${plan.id}-${duration}`}
                                onPress={() =>
                                  setSelectedDurationByPlan((prev) => ({
                                    ...prev,
                                    [plan.id]: duration,
                                  }))
                                }
                                className={`px-4 py-2 rounded-full border ${
                                  isActive
                                    ? "bg-gray-900 border-gray-900"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                              >
                                <Text
                                  className={`text-sm font-semibold ${isActive ? "text-white" : "text-gray-800"}`}
                                >
                                  {label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      <View className="bg-gray-50 border border-gray-100 rounded-2xl p-3 mb-4">
                        <Text className="text-xs text-gray-600 leading-5">
                          By checking this checkbox, I agree with the given
                          Terms and Conditions. I acknowledge that I have read
                          and understood the terms and conditions set forth by
                          the company, and I agree to comply with all policies
                          and guidelines.
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          hasAgreed
                            ? toggleTerms(plan.id)
                            : setTermsModalPlanId(plan.id)
                        }
                        className="flex-row items-center mb-4"
                      >
                        <View
                          className={`w-5 h-5 rounded-md border ${hasAgreed ? "bg-[#FF8C42] border-[#FF8C42]" : "border-gray-300"} items-center justify-center`}
                        >
                          {hasAgreed ? (
                            <Ionicons name="checkmark" size={14} color="#fff" />
                          ) : null}
                        </View>
                        <Text className="text-sm text-gray-800 ml-2">
                          I agree with the given Terms and Conditions.
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleLoanPress(plan)}
                        disabled={!hasAgreed || !hasDuration}
                        className={`w-full py-4 rounded-full items-center justify-center ${
                          hasAgreed && hasDuration ? "bg-black" : "bg-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-base font-semibold ${
                            hasAgreed && hasDuration
                              ? "text-white"
                              : "text-gray-500"
                          }`}
                        >
                          Apply
                        </Text>
                      </TouchableOpacity>

                      {hasDuration && (
                        <View className="mt-5">
                          <Text className="text-sm font-semibold text-gray-900 mb-3">
                            Repayment schedule
                          </Text>
                          {schedulePreview.map((item) => (
                            <TouchableOpacity
                              key={`${plan.id}-${item.label}`}
                              className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 shadow-sm"
                              onPress={() => handleSchedulePress(plan, item)}
                              activeOpacity={0.8}
                            >
                              <View className="flex-row items-center justify-between">
                                <Text className="text-xs font-semibold text-gray-900">
                                  {item.label}
                                </Text>
                                <Text className="text-[11px] text-gray-500">
                                  {item.due}
                                </Text>
                              </View>
                              <Text className="text-[11px] text-gray-500 mt-1">
                                Month: {item.dueMonth}
                              </Text>
                              <Text className="text-lg font-bold text-gray-900 mt-1">
                                {item.amount}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      <View className="mt-4 flex-row justify-between">
                        <Text className="text-xs text-gray-500">
                          Min: {formatEth(plan.minAmount)}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          Selected duration: {monthsLabel}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="bg-gray-50 border border-gray-200 rounded-2xl p-6 items-center">
                <Text className="text-sm text-gray-500 text-center">
                  No loan plans available at the moment.
                </Text>
                <TouchableOpacity onPress={fetchPlans} className="mt-3">
                  <Text className="text-sm text-[#FF8C42] font-medium">
                    Refresh
                  </Text>
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

      <TermsModal
        visible={Boolean(termsModalPlanId)}
        onClose={() => setTermsModalPlanId(null)}
        onAgree={() => {
          if (!termsModalPlanId) return;
          setAgreedTermsByPlan((prev) => ({
            ...prev,
            [termsModalPlanId]: true,
          }));
          setTermsModalPlanId(null);
        }}
        items={TERMS_ITEMS}
      />

      <InfoModal state={infoModal} onClose={closeInfoModal} />
    </SafeAreaView>
  );
}
