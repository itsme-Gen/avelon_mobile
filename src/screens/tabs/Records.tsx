import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useVerificationStore } from "@/stores/verification.store";
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
  const [showVerification, setShowVerification] = useState(false);
  const isVerified = useVerificationStore((state) => state.isVerified);
  const router = useRouter();

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
    <SafeAreaView className="flex-1 bg-white" edges={["right", "bottom", "left"]}>
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
            verify your account to view your records.
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
        <>
          {/* Tab Navigation */}
          <View className="px-5 pt-3 mb-4">
            <View className="flex-row bg-gray-100 rounded-xl p-1">
              <TouchableOpacity
                onPress={() => handleTabPress(0)}
                className={`flex-1 py-3 rounded-lg ${activeTab === 0 ? "bg-white" : "bg-transparent"}`}
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
                className={`flex-1 py-3 rounded-lg ${activeTab === 1 ? "bg-white" : "bg-transparent"}`}
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
                contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
              >
                <View className="px-5">
                  {loanHistory.map((loan) => (
                    <TouchableOpacity
                      key={loan.id}
                      className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row items-center"
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
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View key="2" style={styles.page}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
              >
                <View className="px-5">
                  {paymentHistory.map((payment) => (
                    <TouchableOpacity
                      key={payment.id}
                      className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row items-center"
                    >
                      <View className="w-10 h-10 bg-green-100 rounded-full mr-3 justify-center items-center">
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
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
        </>
      )}
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
