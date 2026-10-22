import { create } from 'zustand';
import * as notificationsApi from '@/services/notifications-api.service';

interface NotificationsState {
    unreadCount: number;
    refresh: () => Promise<void>;
    setUnreadCount: (count: number) => void;
}

// The unread badge on every tab header reads from here
export const useNotificationsStore = create<NotificationsState>((set) => ({
    unreadCount: 0,
    refresh: async () => {
        const result = await notificationsApi.getNotifications(1, 1);
        if (result.success && result.meta) set({ unreadCount: result.meta.unreadCount });
    },
    setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
}));
