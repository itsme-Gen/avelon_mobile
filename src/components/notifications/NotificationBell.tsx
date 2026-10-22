import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useIsFocused, type Href } from "expo-router";
import { useEffect } from "react";
import { AppState, Text, TouchableOpacity, View } from "react-native";
import { useTourTarget } from "@/components/tour";
import { useNotificationsStore } from "@/stores/notifications.store";

const notificationsRoute = "/notifications" as Href;
const POLL_MS = 30_000;

/** Header bell with the unread count. Each tab renders its own; only the focused one polls. */
export function NotificationBell() {
  const focused = useIsFocused();
  const unread = useNotificationsStore((s) => s.unreadCount);
  const refresh = useNotificationsStore((s) => s.refresh);
  const tourRef = useTourTarget("notifications-bell", focused);

  useEffect(() => {
    if (!focused) return;
    refresh().catch(() => {});
    const timer = setInterval(() => {
      if (AppState.currentState === "active") refresh().catch(() => {});
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [focused, refresh]);

  const label = unread > 0 ? `Notifications, ${unread} unread` : "Notifications";

  return (
    <View ref={tourRef} collapsable={false} style={{ marginRight: 12 }}>
      <TouchableOpacity
        onPress={() => router.push(notificationsRoute)}
        style={{ padding: 6 }}
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={6}
      >
        <Ionicons name="notifications-outline" size={24} color="#111827" />
        {unread > 0 && (
          <View
            style={{
              position: "absolute",
              top: 1,
              right: 0,
              minWidth: 18,
              height: 18,
              paddingHorizontal: 4,
              borderRadius: 9,
              backgroundColor: "#FF8C42",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "#fff",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700", lineHeight: 12 }}>
              {unread > 99 ? "99+" : unread}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
