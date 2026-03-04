import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useVerificationStore } from "@/stores/verification.store";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomAlert } from "../../components/alertbutton/CustomAlert";

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

  const loans = [
    {
      id: 1,
      title: "Starting Loan Plan",
      subtitle: "Perfect for beginners",
      amount: "0.00001452 ETH",
      color: "bg-gray-400",
    },
    {
      id: 2,
      title: "Beginner Loan",
      subtitle: "Great for new users",
      amount: "0.00062512 ETH",
      color: "bg-red-500",
    },
    {
      id: 3,
      title: "Starting Loan Plan",
      subtitle: "Perfect for beginners",
      amount: "0.00001452 ETH",
      color: "bg-blue-500",
    },
    {
      id: 4,
      title: "Beginner Loan",
      subtitle: "Great for new users",
      amount: "0.00062512 ETH",
      color: "bg-purple-500",
    },
    {
      id: 5,
      title: "Starting Loan Plan",
      subtitle: "Perfect for beginners",
      amount: "0.00001452 ETH",
      color: "bg-orange-500",
    },
    {
      id: 6,
      title: "Beginner Loan",
      subtitle: "Great for new users",
      amount: "0.00062512 ETH",
      color: "bg-teal-500",
    },
  ];

  const handleLoanPress = (loan: { title: string; amount: string }) => {
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
        title: loan.title,
        amount: loan.amount,
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
      >
        {/* Content */}
        <View className="px-5">
          {renderVerifyBanner}

          <Text className="text-lg font-semibold text-black mb-6">
            Available loans for you
          </Text>

          {/* Loan Cards */}
          {isVerified ? (
            <View>
              {loans.map((loan) => (
                <TouchableOpacity
                  key={loan.id}
                  className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row items-center"
                  onPress={() => handleLoanPress(loan)}
                >
                  <View className={`w-1 h-16 ${loan.color} rounded-full mr-4`} />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 mb-1">
                      {loan.title}
                    </Text>
                    <Text className="text-xs text-gray-500 mb-2">
                      {loan.subtitle}
                    </Text>
                    <Text className="text-lg font-bold text-gray-900">
                      {loan.amount}
                    </Text>
                  </View>
                  <View className="w-10 h-10 rounded-full bg-gray-900 justify-center items-center">
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
