// react-native-web's Alert is a no-op, which made Connect look dead
import { Alert } from "@/utils/alert";

export function useAppKit() {
  return {
    open: () =>
      Alert.alert(
        "Wallet connection unavailable",
        "Use the iOS or Android app to connect a wallet.",
      ),
  };
}
