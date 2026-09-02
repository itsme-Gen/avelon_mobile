import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Redirect, Tabs, router } from "expo-router";
import type { Href } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Dimensions, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabIconProps {
  focused: boolean;
  IconComponent: any;
  iconName: string;
  size?: number;
}

const notificationsRoute = "/notifications" as Href;

const TabIcon = ({
  focused,
  IconComponent,
  iconName,
  size = 28,
}: TabIconProps) => {
  return (
    <View
      className={`w-[50px] h-[50px] rounded-full justify-center items-center self-center  ${focused ? "bg-[#FFE7D2]" : ""}`}
    >
      <IconComponent
        name={iconName}
        size={size}
        color={focused ? "#FF8C42" : "#6B7280"}
      />
    </View>
  );
};

export default function TabsLayout() {
  const { isAuthenticated, checkSession } = useAuthStore();
  const [checked, setChecked] = useState(isAuthenticated);
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  useEffect(() => {
    if (isAuthenticated) {
      setChecked(true);
      return;
    }
    checkSession().finally(() => setChecked(true));
  }, [checkSession, isAuthenticated]);

  if (!checked) {
    return <View className="flex-1 items-center justify-center"><ActivityIndicator /></View>;
  }
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/signin" />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            bottom: insets.bottom + 10,
            width: screenWidth * 0.9,
            marginHorizontal: screenWidth * 0.05,
            height: 70,
            backgroundColor: "#fff",
            borderRadius: 50,
            shadowColor: "#000000",
            shadowOffset: {
              width: 1,
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
            borderTopWidth: 0,
          },
          tabBarItemStyle: {
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 20,
          },
          headerStyle: {
            backgroundColor: "#fff",
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          },
          headerTintColor: "#000",
          headerTitleStyle: {
            fontWeight: "bold",
            fontFamily: "Syne_700Bold",
          },
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                IconComponent={Ionicons}
                iconName={focused ? "home" : "home-outline"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="LoanPlans"
          options={{
            title: "Loan Plans",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                IconComponent={MaterialCommunityIcons}
                iconName={focused ? "bank" : "bank-outline"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Wallet"
            options={{
              title: "My Wallet",
              headerRight: () => (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={{
                    marginRight: 12,
                    padding: 6,
                  }}
                  onPress={() => router.push(notificationsRoute)}
              >
                <Ionicons name="notifications-outline" size={22} color="#111827" />
              </TouchableOpacity>
            ),
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                IconComponent={Ionicons}
                iconName={focused ? "wallet" : "wallet-outline"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Records"
          options={{
            title: "Records",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                IconComponent={Ionicons}
                iconName={focused ? "document-text" : "document-text-outline"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            title: "Profile",
            headerRight: () => (
              <TouchableOpacity
                className="mr-4"
                onPress={() => router.push(notificationsRoute)}
              >
                <Ionicons name="notifications-outline" size={24} color="#000" />
              </TouchableOpacity>
            ),
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                IconComponent={Ionicons}
                iconName={focused ? "person" : "person-outline"}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
