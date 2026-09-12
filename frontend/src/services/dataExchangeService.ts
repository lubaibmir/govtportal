const API_BASE_URL = '/api/v1';

export interface DataExchangePayload {
  consent_token: string;
  providing_department_id: string;
  data_type: string;
}

export interface DataExchangeResponse {
  request_id: string;
  status: string;
  providing_department_id: string;
  data_type: string;
  canonical_payload: Record<string, any>;
  raw_response_hash: string;
  transformed_at: string;
}

export async function executeDataExchange(
  payload: DataExchangePayload,
  token: string
): Promise<DataExchangeResponse> {
  const response = await fetch(`${API_BASE_URL}/data-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Data exchange failed');
  }

  return await response.json();
}
