export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'IN_APP';
  category: string;
  is_read: boolean;
  metadata_info?: Record<string, any> | null;
  created_at: string;
}

export interface NotificationListResponse {
  unread_count: number;
  notifications: NotificationItem[];
}

export async function fetchNotifications(
  token: string,
  channelFilter?: string
): Promise<NotificationListResponse> {
  const query = new URLSearchParams();
  if (channelFilter && channelFilter !== 'ALL') {
    query.append('channel_filter', channelFilter);
  }

  const res = await fetch(`http://localhost:8000/api/v1/notifications?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return res.json();
}

export async function markNotificationAsRead(
  token: string,
  notificationId: string
): Promise<NotificationItem> {
  const res = await fetch(`http://localhost:8000/api/v1/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to mark notification as read');
  }
  return res.json();
}

export async function markAllNotificationsAsRead(token: string): Promise<void> {
  const res = await fetch('http://localhost:8000/api/v1/notifications/read-all', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to mark all as read');
  }
}

export async function simulateNotification(
  token: string,
  payload: { channel: string; title: string; message: string; category?: string }
): Promise<NotificationItem> {
  const res = await fetch('http://localhost:8000/api/v1/notifications/simulate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error('Failed to simulate notification');
  }
  return res.json();
}
