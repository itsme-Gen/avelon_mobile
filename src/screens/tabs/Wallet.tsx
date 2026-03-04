import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useVerificationStore } from "@/stores/verification.store";
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;
const scrollHPadding = 20;
const analyticsCardPadding = 14;
const chartSideMargin = 12;
const chartPaddingRight = 24;
const chartWidth =
  screenWidth -
  scrollHPadding * 2 -
  analyticsCardPadding * 2 -
  chartSideMargin * 2;

export default function WalletScreen() {
  const [showVerification, setShowVerification] = useState(false);
  const isVerified = useVerificationStore((state) => state.isVerified);
  const router = useRouter();

  // Chart data - matching the wave pattern in screenshot
  const chartData = {
    labels: ["7h", "9h", "11h", "13h", "17h", "23h"],
    datasets: [
      {
        data: [12, 38, -10, 30, -6, 24],
        color: (opacity = 1) => `rgba(46, 169, 150, ${opacity})`,
        strokeWidth: 2.5,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(46, 169, 150, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
    propsForDots: {
        r: "5",
        strokeWidth: "2.5",
        stroke: "#ffffff",
        fill: "#2eaa96",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#d8dde6",
      strokeWidth: 1,
    },
    fillShadowGradient: "#39b6a4",
    fillShadowGradientOpacity: 0.24,
  };

  const renderVerifyBanner = !isVerified ? (
    <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-5 flex-row items-center justify-between">
      <View className="flex-1 mr-3">
        <Text className="text-base font-semibold text-gray-900">
          Verify your account
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Verify your account to view wallet details.
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

  if (showVerification) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#f4f5f7" }}
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f4f5f7" }}
      edges={["right", "bottom", "left"]}
    >
      <View className="flex-1 bg-[#f4f5f7]">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 140,
            marginTop:25
          }}
        >
          {renderVerifyBanner}

          {/* Balance Card */}
          <View
            style={{
              backgroundColor: "#f8893c",
              borderRadius: 28,
              padding: 18,
              marginBottom: 16,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.18,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View
              style={{
                position: "absolute",
                bottom: -70,
                left: -40,
                width: 220,
                height: 220,
                borderRadius: 110,
                backgroundColor: "rgba(255,255,255,0.07)",
              }}
            />

            <View
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: "rgba(255,255,255,0.18)",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.25)",
              }}
            >
              <Text className="text-[11px] font-semibold text-[#ffeede]">
                Blocked
              </Text>
            </View>

            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-[#ffe7d4] text-xs font-semibold uppercase mb-1">
                  Balance
                </Text>
                <Text className="text-white text-[28px] font-extrabold leading-tight mb-1">
                  5.000245416 ETH
                </Text>
                <Text className="text-[#ffd7c1] text-sm font-semibold">
                  $ 14625.20
                </Text>
              </View>

            </View>

            <View
              style={{
                flexDirection: "row",
                marginTop: 18,
                gap: 12,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  borderRadius: 18,
                  paddingVertical: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.24)",
                }}
              >
                <Ionicons name="refresh" size={22} color="#fff" />
                <Text className="text-white font-semibold text-[13px] mt-2">
                  Refresh
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  borderRadius: 18,
                  paddingVertical: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.24)",
                }}
              >
                <Ionicons name="power" size={22} color="#fff" />
                <Text className="text-white font-semibold text-[13px] mt-2">
                  Disconnect
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Overview */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 18,
              padding: 16,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="text-[11px] font-semibold text-[#9ca3af] uppercase mb-3">
              Overview
            </Text>

            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-[#111827]">
                  Credit Score
                </Text>
                <Text className="text-[12px] text-[#6b7280] mt-1">
                  On-chain Reputation
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-[26px] font-extrabold text-[#f58a2e]">
                  120
                </Text>
                <View
                  style={{
                    width: 30,
                    height: 4,
                    backgroundColor: "#f8a85a",
                    borderRadius: 6,
                    marginTop: 2,
                  }}
                />
              </View>
            </View>

          </View>

          {/* Analytics */}
          <Text className="text-[11px] font-semibold text-[#9ca3af] uppercase mb-3">
            Analytics
          </Text>
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 18,
              padding: 14,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[15px] font-semibold text-[#111827]">
                ETH Price Volatility
              </Text>
              <View
                style={{
                  backgroundColor: "rgba(248,140,60,0.12)",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(248,140,60,0.24)",
                }}
              >
                <Text className="text-[11px] font-semibold text-[#f58a2e] uppercase">
                  Predictor
                </Text>
              </View>
            </View>

            <View className="items-center">
              <LineChart
                data={chartData}
                width={chartWidth}
                height={190}
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 4,
                  borderRadius: 12,
                  alignSelf: "center",
                  paddingRight: chartPaddingRight,
                }}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLines={true}
                withHorizontalLines={true}
                withDots={true}
                withShadow={true}
                segments={4}
              />
            </View>

            <View className="flex-row items-center justify-center mt-2">
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#2eaa96",
                  marginRight: 8,
                }}
              />
              <Text className="text-[#6b7280] text-[11px] font-medium">
                Current Value: PHP 10,328.74
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Navigation Bar */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            // Keep the nav visible without adding an extra card background
            backgroundColor: "transparent",
          }}
        >
          <View className="flex-row justify-around items-center py-4 px-6">
            <TouchableOpacity className="items-center justify-center p-2">
              <Ionicons name="home-outline" size={26} color="#a0a5ad" />
            </TouchableOpacity>
            <TouchableOpacity className="items-center justify-center p-2">
              <Ionicons name="business-outline" size={26} color="#a0a5ad" />
            </TouchableOpacity>
            <TouchableOpacity className="items-center justify-center p-2">
              <View
                style={{
                  backgroundColor: "#f8893c",
                  padding: 10,
                  borderRadius: 16,
                }}
              >
                <Ionicons name="wallet" size={24} color="#ffffff" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="items-center justify-center p-2">
              <Ionicons name="document-text-outline" size={26} color="#a0a5ad" />
            </TouchableOpacity>
            <TouchableOpacity className="items-center justify-center p-2">
              <Ionicons name="person-outline" size={26} color="#a0a5ad" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
