import Constants from "expo-constants";

type AppConfig = Pick<typeof Constants, "expoConfig" | "easConfig">;

/**
 * The EAS project that push tokens are issued for. app.json already carries it,
 * so EXPO_PUBLIC_EAS_PROJECT_ID is only an override. Without this fallback no
 * build ever asked for a push token.
 */
export function easProjectId(
  override: string | undefined = process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
  config: AppConfig = Constants,
): string | null {
  return override || config.expoConfig?.extra?.eas?.projectId || config.easConfig?.projectId || null;
}
