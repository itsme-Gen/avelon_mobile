import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import type { PagerViewOnPageSelectedEvent } from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";
// @ts-ignore
import PagerView from "react-native-pager-view";

export default function DocumentsScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = useRef<any>(null);

  const loanHistory = [
    {
      id: 1,
      title: "Beginner Loan",
      subtitle: "Borrow date: 12/01/2025",
      amount: "0.00062512 ETH",
      color: "bg-red-500",
    },
    {
      id: 2,
      title: "Starting Loan Plan",
      subtitle: "Borrow date: 11/15/2024",
      amount: "0.00001452 ETH",
      color: "bg-gray-400",
    },
  ];

  const paymentHistory = [
    {
      id: 1,
      title: "Monthly Payment",
      subtitle: "Amount: 0.00054312 ETH",
      date: "Jan 15",
    },
    {
      id: 2,
      title: "Monthly Payment",
      subtitle: "Amount: 0.00054312 ETH",
      date: "Dec 15",
    },
    {
      id: 3,
      title: "Monthly Payment",
      subtitle: "Amount: 0.00054312 ETH",
      date: "Nov 15",
    },
    {
      id: 4,
      title: "Monthly Payment",
      subtitle: "Amount: 0.00054312 ETH",
      date: "Oct 15",
    },
    {
      id: 5,
      title: "Monthly Payment",
      subtitle: "Amount: 0.00054312 ETH",
      date: "Sep 15",
    },
    {
      id: 6,
      title: "Monthly Payment",
      subtitle: "Amount: 0.00054312 ETH",
      date: "Aug 15",
    },
    {
      id: 7,
      title: "Monthly Payment",
      subtitle: "Amount: 0.00054312 ETH",
      date: "Jul 15",
    },
    {
      id: 8,
      title: "Monthly Payment",
      subtitle: "Amount: 0.00054312 ETH",
      date: "Jun 15",
    },
    {
      id: 9,
      title: "Monthly Payment",
      subtitle: "Amount: 0.00054312 ETH",
      date: "May 15",
    },
    {
      id: 10,
      title: "Monthly Payment",
      subtitle: "Amount: 0.00054312 ETH",
      date: "Apr 15",
    },
  ];

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    pagerRef.current?.setPage(index);
  };

  const handlePageSelected = (e: PagerViewOnPageSelectedEvent) => {
    setActiveTab(e.nativeEvent.position);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Tab Navigation */}
      <View className="px-5 mb-4">
        <View className="flex-row bg-gray-100 rounded-xl p-1">
          <TouchableOpacity
            onPress={() => handleTabPress(0)}
            className={`flex-1 py-3 rounded-lg ${
              activeTab === 0 ? "bg-white" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === 0 ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Loan History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleTabPress(1)}
            className={`flex-1 py-3 rounded-lg ${
              activeTab === 1 ? "bg-white" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === 1 ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Payment History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipeable Content */}
      {/* @ts-ignore */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        <View key="1" style={styles.page}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <View className="px-5">
              {loanHistory.map((loan) => (
                <TouchableOpacity
                  key={loan.id}
                  className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row items-center"
                >
                  <View
                    className={`w-1 h-16 ${loan.color} rounded-full mr-4`}
                  />
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
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View key="2" style={styles.page}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <View className="px-5">
              {paymentHistory.map((payment) => (
                <TouchableOpacity
                  key={payment.id}
                  className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row items-center"
                >
                  <View className="w-10 h-10 bg-green-100 rounded-full mr-3 justify-center items-center">
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#10B981"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 mb-1">
                      {payment.title}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {payment.subtitle}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-500">{payment.date}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </PagerView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-24 right-5 w-14 h-14 rounded-full bg-[#FF8C42] justify-center items-center shadow-lg"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
