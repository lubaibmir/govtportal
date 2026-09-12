export interface ResilienceStatus {
  active_outages: string[];
  cached_records_count: number;
  pending_queue_count: number;
  recent_logs_count: number;
}

export interface ResilienceLogEntry {
  id: string;
  timestamp: string;
  department_id: string;
  action: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
  details?: Record<string, any>;
}

export async function fetchResilienceStatus(): Promise<ResilienceStatus> {
  const res = await fetch('http://localhost:8000/api/v1/resilience/status');
  if (!res.ok) {
    return {
      active_outages: [],
      cached_records_count: 0,
      pending_queue_count: 0,
      recent_logs_count: 0
    };
  }
  return res.json();
}

export async function toggleDepartmentOutage(departmentId: string, isOutage: boolean, token: string): Promise<any> {
  const res = await fetch('http://localhost:8000/api/v1/resilience/toggle-outage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      department_id: departmentId,
      is_outage: isOutage
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to toggle outage status');
  }
  return res.json();
}

export async function fetchResilienceLogs(): Promise<ResilienceLogEntry[]> {
  const res = await fetch('http://localhost:8000/api/v1/resilience/logs');
  if (!res.ok) return [];
  return res.json();
}
