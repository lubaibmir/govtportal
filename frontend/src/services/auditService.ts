const API_BASE_URL = '/api/v1';

export interface AuditLogRecord {
  id: number;
  request_id: string;
  timestamp: string;
  actor_id?: string | null;
  actor_role: string;
  action: string;
  resource: string;
  result: string;
  ip_address: string;
  details?: Record<string, any> | null;
}

export async function fetchAuditLogs(
  token: string,
  actionFilter?: string,
  actorRoleFilter?: string
): Promise<AuditLogRecord[]> {
  try {
    let url = `${API_BASE_URL}/audit-logs?limit=50`;
    if (actionFilter && actionFilter !== 'ALL') {
      url += `&action_filter=${encodeURIComponent(actionFilter)}`;
    }
    if (actorRoleFilter && actorRoleFilter !== 'ALL') {
      url += `&actor_role_filter=${encodeURIComponent(actorRoleFilter)}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return await response.json();
  } catch (error) {
    return [];
  }
}
