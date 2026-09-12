export interface Grievance {
  id: string;
  grievance_number: string;
  application_id?: string | null;
  application_number?: string | null;
  citizen_id: string;
  citizen_name: string;
  department_id: string;
  category: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  resolution_notes?: string | null;
  escalated: boolean;
  created_at: string;
  resolved_at?: string | null;
}

export interface CreateGrievancePayload {
  department_id: string;
  category: string;
  description: string;
  application_id?: string | null;
  application_number?: string | null;
}

export interface UpdateGrievancePayload {
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  resolution_notes?: string;
  escalated?: boolean;
}

export async function fetchGrievances(
  token: string,
  params?: { department_id?: string; status_filter?: string }
): Promise<Grievance[]> {
  const query = new URLSearchParams();
  if (params?.department_id) query.append('department_id', params.department_id);
  if (params?.status_filter) query.append('status_filter', params.status_filter);

  const url = `http://localhost:8000/api/v1/grievances?${query.toString()}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch grievances');
  }
  return res.json();
}

export async function createGrievance(
  token: string,
  payload: CreateGrievancePayload
): Promise<Grievance> {
  const res = await fetch('http://localhost:8000/api/v1/grievances', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to submit grievance');
  }
  return res.json();
}

export async function updateGrievance(
  token: string,
  grievanceId: string,
  payload: UpdateGrievancePayload
): Promise<Grievance> {
  const res = await fetch(`http://localhost:8000/api/v1/grievances/${grievanceId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update grievance');
  }
  return res.json();
}
