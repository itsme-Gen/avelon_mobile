import { Alert } from "react-native";

export function useAppKit() {
  return {
    open: () =>
      Alert.alert(
        "Wallet connection unavailable",
        "Use the iOS or Android app to connect a wallet.",
      ),
  };
}
