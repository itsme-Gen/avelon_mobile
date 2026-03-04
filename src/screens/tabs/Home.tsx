import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useVerificationStore } from "@/stores/verification.store";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomAlert } from "../../components/alertbutton/CustomAlert";

export default function HomeScreen() {
  const screenWidth = Dimensions.get("window").width;
  const { bottom } = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 84; // buffer to clear bottom tab bar
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
  const router = useRouter();

  const chartData = {
    labels: ["1h", "6h", "12h", "1D", "1W", "1M", "3M", "1Y", "5Y", "ALL"],
    datasets: [
      {
        data: [2800, 3200, 2900, 3500, 3100, 3800, 3400, 3000, 2700, 3200],
        color: (opacity = 1) => `rgba(255, 140, 66, 1)`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 140, 66, 0.95)`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "0",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#E5E7EB",
      strokeWidth: 1,
    },
  };

  const handleApplyLoan = () => {
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

    router.push("/LoanPlans");
  };

  const renderVerifyBanner = !isVerified ? (
    <View className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-5 flex-row items-center justify-between">
      <View className="flex-1 mr-3">
        <Text className="text-base font-semibold text-gray-900">
          Verify your account
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Verify your account now to see details.
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
      <SafeAreaView
        className="flex-1 bg-white"
        edges={["right", "bottom", "left"]}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 0,
            paddingBottom: bottom + 24,
          }}
          contentInsetAdjustmentBehavior="never"
        >
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
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["right", "bottom", "left"]}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottom + TAB_BAR_HEIGHT,marginTop:20 }}
        contentInsetAdjustmentBehavior="never"
      >
        {/* Hero Section */}
        <View className="px-5">
          {renderVerifyBanner}

          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Borrow crypto, instantly!
          </Text>

          {/* Balance Cards */}
          <View className="flex-row justify-between gap-3 mb-6">
            {/* Current Balance Card */}
            <View className="flex-1 bg-gray-50 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="text-xs text-gray-600">Current</Text>
              </View>
              <Text className="text-sm text-gray-500 mb-1">Balance</Text>
              <Text className="text-base font-bold text-gray-900">
                0.05245412 ETH
              </Text>
            </View>

            {/* Loan Application Card */}
            <TouchableOpacity
              className="flex-1 bg-[#FF8C42] rounded-2xl p-4"
              onPress={handleApplyLoan}
              activeOpacity={0.9}
            >
              <View className="flex-row items-center mb-2">
                <View className="w-2 h-2 rounded-full bg-white mr-2" />
                <Text className="text-xs text-white">Loan</Text>
              </View>
              <Text className="text-sm text-white mb-1">Application</Text>
              <Text className="text-base font-bold text-white">
                Apply for a Loan
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chart Section */}
          <View className="bg-white rounded-2xl mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              ETH Price Volatility Prediction
            </Text>

            <LineChart
              data={chartData}
              width={screenWidth - 72}
              height={180}
              chartConfig={chartConfig}
              bezier
              style={{
                marginVertical: 4,
                borderRadius: 12,
              }}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={true}
              withDots={true}
              withShadow={true}
              segments={4}
            />

            {/* Current Value Indicator */}
            <View className="flex-row items-center justify-center mt-2">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <Text className="text-xs text-gray-600">
                Current Value: Full ($3216%)
              </Text>
            </View>
          </View>

          {/* Available Loans Section */}
          {isVerified && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold text-gray-900">
                  Available Loans
                </Text>
                <TouchableOpacity>
                  <Text className="text-sm text-[#FF8C42] font-medium">
                    See all
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Loan Card 1 - Starting Loan */}
              <TouchableOpacity
                className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row items-center"
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/loan-application",
                    params: {
                      title: "Starting Loan Plan",
                      amount: "0.00001452 ETH",
                    },
                  })
                }
              >
                <View className="w-1 h-16 bg-green-500 rounded-full mr-4" />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    Starting Loan Plan
                  </Text>
                  <Text className="text-xs text-gray-500 mb-2">
                    APR: 5% / 12 months
                  </Text>
                  <Text className="text-lg font-bold text-gray-900">
                    0.00001452 ETH
                  </Text>
                </View>
                <View className="w-10 h-10 rounded-full bg-gray-900 justify-center items-center">
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              </TouchableOpacity>

              {/* Loan Card 2 - Beginner Loan */}
              <TouchableOpacity
                className="bg-gray-50 rounded-2xl p-4 flex-row items-center"
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/loan-application",
                    params: {
                      title: "Beginner Loan",
                      amount: "0.00062512 ETH",
                    },
                  })
                }
              >
                <View className="w-1 h-16 bg-red-500 rounded-full mr-4" />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    Beginner Loan
                  </Text>
                  <Text className="text-xs text-gray-500 mb-2">
                    APR: 7% / 6 months
                  </Text>
                  <Text className="text-lg font-bold text-gray-900">
                    0.00062512 ETH
                  </Text>
                </View>
                <View className="w-10 h-10 rounded-full bg-gray-900 justify-center items-center">
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
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
