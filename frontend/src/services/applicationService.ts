const API_BASE_URL = '/api/v1';

export interface ApplicationPayload {
  service_id: string;
  department_id: string;
  application_data: Record<string, any>;
  consent_ids?: string[];
}

export interface ApplicationRecord {
  id: string;
  application_number: string;
  citizen_id: string;
  service_id: string;
  department_id: string;
  application_data: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function submitApplication(
  payload: ApplicationPayload,
  token: string
): Promise<ApplicationRecord> {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to submit application');
  }

  return await response.json();
}

export async function fetchUserApplications(token: string): Promise<ApplicationRecord[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch applications');
    return await response.json();
  } catch (error) {
    return [];
  }
}
