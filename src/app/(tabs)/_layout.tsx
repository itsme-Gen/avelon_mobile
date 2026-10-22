import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Redirect, Tabs } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Dimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useFirstRunTour, useTourTarget } from "@/components/tour";

interface TabIconProps {
  name: string;
  focused: boolean;
  IconComponent: any;
  iconName: string;
  size?: number;
}

const TabIcon = ({
  name,
  focused,
  IconComponent,
  iconName,
  size = 28,
}: TabIconProps) => {
  // The tour falls back to the tab icon when a screen has nothing to point at
  const tourRef = useTourTarget(`tab-${name}`);
  return (
    <View
      ref={tourRef}
      collapsable={false}
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
  useFirstRunTour();
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
          headerRight: () => <NotificationBell />,
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name="Home"
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
                name="LoanPlans"
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
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name="Wallet"
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
                name="Records"
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
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name="Profile"
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
