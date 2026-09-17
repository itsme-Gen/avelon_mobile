/**
 * Notifications API Service
 * Handles fetching, reading, and managing in-app notifications.
 */
import { API_BASE_URL } from '@/config';
import { getAccessToken } from '@/utils/storage';
import { authenticatedFetch } from './authenticated-fetch';

// ─── Types ──────────────────────────────────────────────────

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    metadata: Record<string, unknown> | null;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
}

export interface NotificationsMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    unreadCount: number;
}

// ─── Helpers ────────────────────────────────────────────────

async function authJsonHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

// ─── API Calls ──────────────────────────────────────────────

/**
 * Get user's notifications with pagination
 */
export async function getNotifications(
    page = 1,
    limit = 20,
    unreadOnly = false,
): Promise<{ success: boolean; data?: Notification[]; meta?: NotificationsMeta; error?: string }> {
    try {
        const params = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(unreadOnly ? { unread: 'true' } : {}),
        });

        const response = await authenticatedFetch(`${API_BASE_URL}/notifications?${params}`, {
            method: 'GET',
            headers: await authJsonHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to fetch notifications' };
        }

        return { success: true, data: result.data, meta: result.meta };
    } catch (error) {
        console.error('[Notifications] Get error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await authenticatedFetch(
            `${API_BASE_URL}/notifications/${encodeURIComponent(notificationId)}/read`,
            {
                method: 'PUT',
                headers: await authJsonHeaders(),
            },
        );

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to mark as read' };
        }

        return { success: true };
    } catch (error) {
        console.error('[Notifications] Mark read error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/notifications/read-all`, {
            method: 'PUT',
            headers: await authJsonHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to mark all as read' };
        }

        return { success: true };
    } catch (error) {
        console.error('[Notifications] Mark all read error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}
