import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabIconProps {
  focused: boolean;
  IconComponent: any;
  iconName: string;
  size?: number;
}

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
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const margin = screenWidth * 0.05;

  return (
    <>
      <StatusBar style="dark" backgroundColor="#fff" />
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
          name="BankBuilding"
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
                onPress={() => {
                  // Handle notification press
                  console.log("Notification pressed");
                }}
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