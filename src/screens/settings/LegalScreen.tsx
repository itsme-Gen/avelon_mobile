import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LegalScreenProps {
  onBack: () => void;
}

export default function LegalScreen({ onBack }: LegalScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["right", "bottom", "left"]}>
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
        >
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 ml-3">Legal Information</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-white rounded-xl p-5 mb-3">
          <Text className="text-base font-bold text-gray-900 mb-3">Terms of Service</Text>
          <Text className="text-sm text-gray-500 leading-5">
            By using Avelon, you agree to our terms of service. Avelon provides a blockchain-based micro-lending platform.
            Users must be at least 18 years of age and complete identity verification (KYC) before accessing lending services.
            {"\n\n"}
            Loan and collateral events use smart contracts on the configured test network. Some administrative and repayment
            records are also maintained by the backend. Interest rates, collateral requirements, and repayment terms are shown
            before confirmation.
            {"\n\n"}
            Avelon reserves the right to modify these terms at any time. Continued use of the platform constitutes acceptance
            of updated terms.
          </Text>
        </View>

        <View className="bg-white rounded-xl p-5 mb-3">
          <Text className="text-base font-bold text-gray-900 mb-3">Privacy Policy</Text>
          <Text className="text-sm text-gray-500 leading-5">
            Avelon collects personal information necessary for identity verification and loan processing, including your name,
            email address, phone number, and government-issued identification documents.
            {"\n\n"}
            This capstone prototype uses encrypted network transport where configured, access controls, and audit records. It is
            not certified for production storage of real identity documents. Use synthetic demonstration data only.
            {"\n\n"}
            Account-deletion and formal data-retention workflows are not yet implemented in this prototype.
          </Text>
        </View>

        <View className="bg-white rounded-xl p-5">
          <Text className="text-base font-bold text-gray-900 mb-3">Disclaimer</Text>
          <Text className="text-sm text-gray-500 leading-5">
            Cryptocurrency values are volatile. The value of collateral may fluctuate significantly during the loan term.
            Avelon is not responsible for losses due to market movements.
            {"\n\n"}
            This platform is developed as a capstone project for educational purposes. Users should exercise caution and
            understand the risks associated with cryptocurrency lending.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
