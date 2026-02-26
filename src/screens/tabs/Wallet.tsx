import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useVerificationStore } from "@/stores/verification.store";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

export default function WalletScreen() {
  const [showVerification, setShowVerification] = useState(false);
  const isVerified = useVerificationStore((state) => state.isVerified);
  const router = useRouter();

  // Chart data - matching the wave pattern in screenshot
  const chartData = {
    labels: ["", "", "", "", "", ""],
    datasets: [
      {
        data: [45, 75, 35, 80, 30, 65],
        color: (opacity = 1) => `rgba(167, 139, 250, ${opacity})`, // Violet/Purple
        strokeWidth: 2.5,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#f8f9fa",
    backgroundGradientTo: "#f8f9fa",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(167, 139, 250, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "3",
      stroke: "#ffffff",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#e5e7eb",
      strokeWidth: 1,
    },
    fillShadowGradient: "rgba(167, 139, 250, 0.4)",
    fillShadowGradientOpacity: 0.6,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["right", "bottom", "left"]}>
      {showVerification ? (
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
      ) : !isVerified ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6">
            <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center">
              <Ionicons name="shield-checkmark" size={32} color="#fff" />
            </View>
          </View>

          <Text className="text-base text-gray-700 mb-6 text-center">
            verify your account to view wallet details.
          </Text>

          <TouchableOpacity
            onPress={() => setShowVerification(true)}
            className="bg-black px-12 py-4 rounded-full"
          >
            <Text className="text-white font-semibold text-base">
              Verify Account
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1 px-5">
          {/* Header */}
          <View className="flex-row justify-between items-center py-4 mb-2">
            <Text className="text-white text-xl font-bold">My Wallet</Text>
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: 8,
                borderRadius: 8,
              }}
            >
              <Ionicons name="notifications-outline" size={22} color="white" />
            </View>
          </View>

          {/* Balance Card - Exact orange gradient */}
          <View
            style={{
              backgroundColor: "#ff9d5c",
              borderRadius: 28,
              padding: 20,
              marginBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-white/90 text-xs font-medium mb-1.5">
                  Balance
                </Text>
                <Text className="text-white text-[28px] font-bold leading-tight mb-0.5">
                  5.00024516 ETH
                </Text>
                <Text className="text-white/80 text-sm font-medium">
                  $ 14822.30
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "#4db8e8",
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="person" size={22} color="white" />
              </View>
            </View>
          </View>

          {/* Chart Section - Exact white background */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 20,
              padding: 16,
              marginBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Text className="text-gray-800 font-semibold text-[15px] mb-2">
              ETH Price Volatility Prediction
            </Text>

            <View className="items-center">
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
            </View>

            <View className="flex-row items-center justify-center mt-1">
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#4ade80",
                  marginRight: 8,
                }}
              />
              <Text className="text-gray-600 text-[11px] font-medium">
                Current Value: ETH 10,326.84
              </Text>
            </View>
          </View>

          {/* Action Buttons - First Row */}
          <View className="flex-row gap-3 mb-3">
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#dc2626",
                borderRadius: 100,
                paddingVertical: 14,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Text className="text-white font-bold text-[15px]">Disconnect</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#1a1a1a",
                borderRadius: 100,
                paddingVertical: 14,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Text className="text-white font-bold text-[15px]">Refresh</Text>
            </TouchableOpacity>
          </View>

          {/* Secondary Buttons - Second Row (outlined) */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              style={{
                flex: 1,
                borderWidth: 1.5,
                borderColor: "#d1d5db",
                backgroundColor: "#ffffff",
                borderRadius: 100,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text className="text-gray-700 font-semibold text-[15px]">
                Disconnect
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                borderWidth: 1.5,
                borderColor: "#d1d5db",
                backgroundColor: "#ffffff",
                borderRadius: 100,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text className="text-gray-700 font-semibold text-[15px]">
                Refresh
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Navigation Bar */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#ffffff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          >
            <View className="flex-row justify-around items-center py-4 px-6">
              <TouchableOpacity className="items-center justify-center p-2">
                <Ionicons name="home-outline" size={26} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity className="items-center justify-center p-2">
                <Ionicons name="stats-chart-outline" size={26} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity className="items-center justify-center p-2">
                <Ionicons name="wallet" size={26} color="#ff9d5c" />
              </TouchableOpacity>
              <TouchableOpacity className="items-center justify-center p-2">
                <Ionicons name="document-text-outline" size={26} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity className="items-center justify-center p-2">
                <Ionicons name="person-outline" size={26} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
