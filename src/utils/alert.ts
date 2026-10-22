import { Alert as NativeAlert, Platform, type AlertButton } from "react-native";

// react-native-web's Alert.alert is a no-op, so on web every result message and
// confirmation went nowhere. This keeps the native dialog and falls back to the
// browser's own on web, still running the chosen button's handler.
function alert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS !== "web") {
    NativeAlert.alert(title, message, buttons);
    return;
  }

  const text = message ? `${title}\n\n${message}` : title;
  const actions = buttons?.filter((b) => b.style !== "cancel") ?? [];
  const cancel = buttons?.find((b) => b.style === "cancel");

  if (!buttons || buttons.length <= 1 || actions.length === 0) {
    window.alert(text);
    buttons?.[0]?.onPress?.();
    return;
  }

  // Two choices map onto confirm(): OK runs the action, Cancel the cancel button
  if (window.confirm(text)) {
    actions[0].onPress?.();
  } else {
    cancel?.onPress?.();
  }
}

export const Alert = { alert };
