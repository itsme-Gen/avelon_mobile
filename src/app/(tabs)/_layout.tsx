import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import icons - using require with explicit relative paths
// Path: src/app/(tabs)/_layout.tsx -> assets/images/bar-icons/
const HomeActive = require('../../../assets/images/bar-icons/active_state/Home_active.png');
const HomeNormal = require('../../../assets/images/bar-icons/normal_state/home_normal.png');
const LoanActive = require('../../../assets/images/bar-icons/active_state/Loan_active.png');
const LoanNormal = require('../../../assets/images/bar-icons/normal_state/loan_normal.png');
const WalletActive = require('../../../assets/images/bar-icons/active_state/wallet_active.png');
const WalletNormal = require('../../../assets/images/bar-icons/normal_state/wallet_normal.png');
const RecordActive = require('../../../assets/images/bar-icons/active_state/record_active.png');
const RecordNormal = require('../../../assets/images/bar-icons/normal_state/record_normal.png');
const ProfileActive = require('../../../assets/images/bar-icons/active_state/Profile_active.png');
const ProfileNormal = require('../../../assets/images/bar-icons/normal_state/profile_normal.png');

const icons = {
  home: { active: HomeActive, inactive: HomeNormal },
  loan: { active: LoanActive, inactive: LoanNormal },
  wallet: { active: WalletActive, inactive: WalletNormal },
  record: { active: RecordActive, inactive: RecordNormal },
  profile: { active: ProfileActive, inactive: ProfileNormal },
};

interface TabIconProps {
  focused: boolean;
  icon: {
    active: any;
    inactive: any;
  };
}

const TabIcon = ({ focused, icon }: TabIconProps) => (
  <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
    <Image
      source={focused ? icon.active : icon.inactive}
      style={styles.icon}
      resizeMode="contain"
    />
  </View>
);

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar style="dark" backgroundColor="#fff" />
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: insets.bottom + 16,
            left: 20,
            right: 20,
            height: 70,
            backgroundColor: '#fff',
            borderRadius: 35,
            // Shadow matching design: X:1, Y:1, Blur:10, Color:#000 at 10%
            shadowColor: '#000000',
            shadowOffset: {
              width: 1,
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
            borderTopWidth: 0,
            paddingHorizontal: 10,
          },
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.home} />
            ),
          }}
        />
        <Tabs.Screen
          name="bankbuilding"
          options={{
            title: 'Loan Plans',
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.loan} />
            ),
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: 'My Wallet',
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.wallet} />
            ),
          }}
        />
        <Tabs.Screen
          name="document"
          options={{
            title: 'Documents',
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.record} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.profile} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    backgroundColor: '#FFE7D2',
  },
  icon: {
    width: 24,
    height: 24,
  },
});