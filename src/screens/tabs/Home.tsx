import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const screenWidth = Dimensions.get("window").width;

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

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["right", "bottom", "left"]}
    >
      <ScrollView
        className="flex-1 mt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Hero Section */}
        <View className="px-5">
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
            <TouchableOpacity className="flex-1 bg-[#FF8C42] rounded-2xl p-4">
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
            <TouchableOpacity className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row items-center">
              <View className="w-1 h-16 bg-green-500 rounded-full mr-4" />
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  Starting Loan Plan
                </Text>
                <Text className="text-xs text-gray-500 mb-2">
                  APR: 5% • 12 months
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
            <TouchableOpacity className="bg-gray-50 rounded-2xl p-4 flex-row items-center">
              <View className="w-1 h-16 bg-red-500 rounded-full mr-4" />
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  Beginner Loan
                </Text>
                <Text className="text-xs text-gray-500 mb-2">
                  APR: 7% • 6 months
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
