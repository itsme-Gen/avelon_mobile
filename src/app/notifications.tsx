import NotificationsScreen from "@/screens/settings/NotificationsScreen";
import { router } from "expo-router";

export default function NotificationsRoute() {
  return <NotificationsScreen onBack={() => router.back()} />;
}
