import AsyncStorage from "@react-native-async-storage/async-storage";

// Per user, so a shared phone shows the tour to each new account once
export interface TourState {
  introDone: boolean;
  // Whether the intro already covered the verified screens
  sawVerified: boolean;
}

const key = (userId: string) => `avelon:tour:v1:${userId}`;

// Native AsyncStorage writes land asynchronously; without this a load right after
// finishing read the old state and the tour started again
const memory = new Map<string, TourState>();

export async function loadTourState(userId: string): Promise<TourState> {
  const cached = memory.get(userId);
  if (cached) return cached;
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    if (raw) return { introDone: false, sawVerified: false, ...JSON.parse(raw) };
  } catch {
    // Unreadable storage counts as a fresh install
  }
  return { introDone: false, sawVerified: false };
}

export async function saveTourState(userId: string, state: TourState): Promise<void> {
  memory.set(userId, state);
  try {
    await AsyncStorage.setItem(key(userId), JSON.stringify(state));
  } catch {
    // Worst case the tour shows again
  }
}
