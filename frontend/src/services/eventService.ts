const API_BASE_URL = '/api/v1';

export interface ApplicationEventRecord {
  id: string;
  application_id: string;
  event_type: string;
  actor_name: string;
  description: string;
  metadata_info?: Record<string, any> | null;
  created_at: string;
}

export async function fetchApplicationEvents(
  applicationNumber: string,
  token: string
): Promise<ApplicationEventRecord[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/applications/${applicationNumber}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch application events');
    return await response.json();
  } catch (error) {
    return [];
  }
}

export async function updateApplicationStatus(
  applicationNumber: string,
  newStatus: string,
  remarks: string,
  token: string
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationNumber}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: newStatus,
      remarks: remarks
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to update application status');
  }

  return await response.json();
}

export interface ApplicationTrackingData {
  id: string;
  application_number: string;
  citizen_id: string;
  service_id: string;
  service_title: string;
  department_id: string;
  department_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  application_data: Record<string, any>;
  events: ApplicationEventRecord[];
}

export async function fetchTrackingDetails(applicationNumber: string): Promise<ApplicationTrackingData> {
  const response = await fetch(`${API_BASE_URL}/applications/track/${applicationNumber}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Application '${applicationNumber}' not found`);
  }
  return await response.json();
}
