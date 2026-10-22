import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Linking, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as notificationsApi from "@/services/notifications-api.service";
import type { NotificationPreferences } from "@/services/notifications-api.service";
import { getNotifications, registerDeviceToken } from "@/services/notification.service";

interface NotificationSettingsScreenProps {
  onBack: () => void;
}

type PushState = "granted" | "denied" | "undetermined" | "unavailable";

const ROWS: { key: "LoanUpdates" | "RepaymentReminders" | "LiquidationAlerts"; label: string; hint: string }[] = [
  { key: "LoanUpdates", label: "Loan updates", hint: "Verification, approvals, payouts and payments" },
  { key: "RepaymentReminders", label: "Repayment reminders", hint: "Due soon and overdue notices" },
  { key: "LiquidationAlerts", label: "Price and stake alerts", hint: "Margin calls and liquidation" },
];

async function readPushState(): Promise<PushState> {
  const Notifications = getNotifications();
  if (!Notifications || Platform.OS === "web") return "unavailable";
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted" ? "granted" : status === "denied" ? "denied" : "undetermined";
  } catch {
    return "unavailable";
  }
}

export default function NotificationSettingsScreen({ onBack }: NotificationSettingsScreenProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [pushState, setPushState] = useState<PushState>("unavailable");

  const load = useCallback(async () => {
    setError(null);
    const result = await notificationsApi.getPreferences();
    if (result.success && result.data) setPrefs(result.data);
    else setError(result.error ?? "Could not load your notification settings.");
  }, []);

  useEffect(() => {
    load();
    readPushState().then(setPushState);
  }, [load]);

  const toggle = async (field: keyof NotificationPreferences, value: boolean) => {
    if (!prefs) return;
    const before = prefs;
    setPrefs({ ...prefs, [field]: value });
    setSaving(field);
    const result = await notificationsApi.updatePreferences({ [field]: value });
    setSaving(null);
    if (result.success && result.data) {
      setPrefs(result.data);
    } else {
      setPrefs(before);
      setError(result.error ?? "That change was not saved. Try again.");
    }
  };

  const turnOnPush = async () => {
    await registerDeviceToken();
    setPushState(await readPushState());
  };

  const renderSection = (channel: "push" | "email", title: string) => (
    <View className="mb-5">
      <Text className="text-sm font-semibold text-gray-400 mb-2 px-6 py-2">{title}</Text>
      <View className="bg-white mx-4 rounded-xl overflow-hidden">
        {ROWS.map((row, i) => {
          const field = `${channel}${row.key}` as keyof NotificationPreferences;
          return (
            <View
              key={field}
              className={`flex-row items-center justify-between px-4 py-3.5 ${i > 0 ? "border-t border-gray-100" : ""}`}
            >
              <View className="flex-1 mr-3">
                <Text className="text-[15px] text-gray-800">{row.label}</Text>
                <Text className="text-xs text-gray-500 mt-0.5">{row.hint}</Text>
              </View>
              {saving === field ? (
                <ActivityIndicator size="small" color="#1F2937" />
              ) : (
                <Switch
                  value={Boolean(prefs?.[field])}
                  onValueChange={(v) => toggle(field, v)}
                  trackColor={{ false: "#E5E7EB", true: "#FF8C42" }}
                  thumbColor="#ffffff"
                  accessibilityLabel={`${title} ${row.label}`}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["right", "bottom", "left"]}>
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 ml-3">Notification Settings</Text>
      </View>

      {!prefs && !error ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1F2937" />
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}>
          {error && (
            <View className="mx-4 mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex-row items-center justify-between">
              <Text className="text-sm text-red-700 flex-1 mr-3">{error}</Text>
              {!prefs && (
                <TouchableOpacity onPress={load}>
                  <Text className="text-sm font-semibold text-red-700">Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {prefs && (
            <>
              {pushState === "denied" && (
                <View className="mx-4 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <Text className="text-sm text-amber-800">
                    Push notifications are turned off for Avelon in your phone's settings. You still get them here in the app and by email.
                  </Text>
                  <TouchableOpacity onPress={() => Linking.openSettings()} className="mt-2">
                    <Text className="text-sm font-semibold text-amber-900">Open settings</Text>
                  </TouchableOpacity>
                </View>
              )}
              {pushState === "undetermined" && (
                <View className="mx-4 mb-4 bg-white border border-gray-200 rounded-xl p-3 flex-row items-center justify-between">
                  <Text className="text-sm text-gray-700 flex-1 mr-3">Allow push notifications to get alerts on this phone.</Text>
                  <TouchableOpacity onPress={turnOnPush} className="bg-black rounded-full px-4 py-2">
                    <Text className="text-sm font-semibold text-white">Allow</Text>
                  </TouchableOpacity>
                </View>
              )}
              {pushState === "unavailable" && (
                <View className="mx-4 mb-4 bg-white border border-gray-200 rounded-xl p-3">
                  <Text className="text-sm text-gray-600">
                    Push notifications need the installed Avelon app. Your choices below still apply on your phone and to email.
                  </Text>
                </View>
              )}
              {renderSection("push", "PUSH NOTIFICATIONS")}
              {renderSection("email", "EMAIL")}
              <Text className="text-xs text-gray-500 px-6">
                In-app notifications are always on, so you never miss a decision about your loan.
              </Text>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
