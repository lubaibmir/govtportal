const API_BASE_URL = '/api/v1';

export interface ConsentPayload {
  requesting_department_id: string;
  providing_department_id: string;
  service_id: string;
  purpose: string;
  requested_fields: string[];
  valid_duration_hours?: number;
}

export interface ConsentRecord {
  id: string;
  citizen_id: string;
  requesting_department_id: string;
  providing_department_id: string;
  service_id: string;
  purpose: string;
  requested_fields: string[];
  consent_token?: string | null;
  status: 'PENDING' | 'ACTIVE' | 'DENIED' | 'EXPIRED' | 'REVOKED';
  created_at: string;
  expires_at: string;
}

export async function createConsent(payload: ConsentPayload, token: string): Promise<ConsentRecord> {
  const response = await fetch(`${API_BASE_URL}/consents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to create consent request');
  }

  return await response.json();
}

export async function approveConsent(consentId: string, token: string): Promise<ConsentRecord> {
  const response = await fetch(`${API_BASE_URL}/consents/${consentId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to approve consent');
  }

  return await response.json();
}

export async function denyConsent(consentId: string, token: string): Promise<ConsentRecord> {
  const response = await fetch(`${API_BASE_URL}/consents/${consentId}/deny`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to deny consent');
  }

  return await response.json();
}

export async function revokeConsent(consentId: string, token: string): Promise<ConsentRecord> {
  const response = await fetch(`${API_BASE_URL}/consents/${consentId}/revoke`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to revoke consent');
  }

  return await response.json();
}

export async function fetchUserConsents(token: string): Promise<ConsentRecord[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/consents`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch consents');
    return await response.json();
  } catch (error) {
    return [];
  }
}
