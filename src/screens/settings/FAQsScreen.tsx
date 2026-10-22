import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FAQsScreenProps {
  onBack: () => void;
}

const FAQS = [
  {
    question: "What is Avelon?",
    answer: "Avelon lends ETH from a pool that investors fund. You lock a stake in ETH, receive the loan in your wallet, and get the stake back when you repay.",
  },
  {
    question: "How do I apply for a loan?",
    answer: "Verify your identity, connect your wallet, then pick a plan, an amount and a term on Loan Plans. An administrator reviews every application and you are notified of the decision.",
  },
  {
    question: "What is the stake?",
    answer: "The stake is ETH you lock when your loan is approved, between 35% and 60% of the loan depending on the plan. It is returned in full once the loan is repaid.",
  },
  {
    question: "How do I repay my loan?",
    answer: "Open the loan under Records and tap Make Repayment. Pay the full balance, or part of it now and the rest by the due date. Always pay through the app so the payment is matched to your loan.",
  },
  {
    question: "What happens if I miss the due date?",
    answer: "You get a reminder before the due date and a notice once it passes. If it stays unpaid, the stake can be seized. There are no late fees.",
  },
  {
    question: "Can a drop in the ETH price take my stake?",
    answer: "No. Your loan and your stake are both in ETH, so the price does not change what you owe in ETH. Big price moves send you a warning, but only a missed due date can cost the stake.",
  },
  {
    question: "How does identity verification work?",
    answer: "You upload a government ID and take a selfie. Automated checks read the ID and compare the photos, and an administrator can review the result.",
  },
  {
    question: "Is this real money?",
    answer: "No. Avelon is a capstone prototype running on a test network with test ETH. Use demonstration data only.",
  },
];

export default function FAQsScreen({ onBack }: FAQsScreenProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["right", "bottom", "left"]}>
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
        >
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 ml-3">FAQs</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {FAQS.map((faq, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
            className="bg-white rounded-xl mb-3 overflow-hidden"
          >
            <View className="flex-row items-center justify-between p-4">
              <Text className="text-[15px] font-medium text-gray-900 flex-1 mr-3">
                {faq.question}
              </Text>
              <Ionicons
                name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                size={20}
                color="#9CA3AF"
              />
            </View>
            {expandedIndex === index && (
              <View className="px-4 pb-4">
                <Text className="text-sm text-gray-500 leading-5">{faq.answer}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
