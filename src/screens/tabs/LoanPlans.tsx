import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoanPlans() {
  const router = useRouter();

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

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["right", "bottom", "left"]}
    >
      <ScrollView
        className="flex-1 mt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
      >
        {/* Content */}
        <View className="px-5">
          <Text className="text-lg font-semibold text-black mb-6">
            Available loans for you
          </Text>

          {/* Loan Cards */}
          <View>
            {loans.map((loan) => (
              <TouchableOpacity
                key={loan.id}
                className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row items-center"
                onPress={() =>
                  router.push({
                    pathname: "/loan-application",
                    params: {
                      title: loan.title,
                      amount: loan.amount,
                    },
                  })
                }
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
