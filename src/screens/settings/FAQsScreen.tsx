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
    answer: "Avelon is a blockchain-based micro-lending platform that allows users to borrow and lend using cryptocurrency as collateral.",
  },
  {
    question: "How do I apply for a loan?",
    answer: "After verifying your identity (KYC), connect your wallet, then browse available loan plans and submit an application with your desired amount and duration.",
  },
  {
    question: "What is collateral?",
    answer: "Collateral is the cryptocurrency (ETH) you deposit as security for your loan. The required collateral amount depends on your loan plan's collateral ratio.",
  },
  {
    question: "How do I repay my loan?",
    answer: "You can repay your loan by sending the repayment amount in ETH to the designated contract address. Partial repayments are accepted.",
  },
  {
    question: "What happens if I miss a payment?",
    answer: "Late payments may incur penalty fees as specified in your loan plan. In this build, liquidation is limited to overdue default after the configured grace period; ETH volatility is advisory only.",
  },
  {
    question: "How does KYC verification work?",
    answer: "KYC requires a government ID and selfie. Automated checks assist the review, but uncertain or unavailable AI results stay pending for manual administrator review.",
  },
  {
    question: "Is my data secure?",
    answer: "This is a capstone prototype, not a certified production KYC system. Use synthetic demonstration data only; production document storage remains disabled until a secure object-storage adapter is implemented.",
  },
];

export default function FAQsScreen({ onBack }: FAQsScreenProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["right", "bottom", "left"]}>
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={onBack}
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
