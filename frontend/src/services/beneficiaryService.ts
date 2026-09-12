export interface FederatedIdentityItem {
  department_id: string;
  department_name: string;
  registry_name: string;
  identifier_type: string;
  identifier_value: string;
  verified_status: string;
}

export interface Beneficiary360Data {
  citizen_id: string;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  city: string;
  district: string;
  pincode: string;
  national_id_hash: string;
  federated_identities: FederatedIdentityItem[];
  total_applications: number;
  applications: Array<{
    id: string;
    application_number: string;
    service_id: string;
    department_id: string;
    status: string;
    created_at: string;
    has_cross_verification: boolean;
  }>;
  total_consents: number;
  consents: Array<{
    id: string;
    requesting_dept: string;
    providing_dept: string;
    purpose: string;
    status: string;
    consent_token: string;
    created_at: string;
  }>;
  total_grievances: number;
  grievances: Array<{
    id: string;
    grievance_number: string;
    department_id: string;
    category: string;
    status: string;
    escalated: boolean;
    created_at: string;
  }>;
  total_benefits_disbursed_inr: number;
}

export interface DuplicateCandidate {
  citizen_id: string;
  full_name: string;
  phone: string;
  email: string;
  national_id_hash: string;
  match_score: number;
  match_reasons: string[];
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  federated_count: number;
}

export interface DeduplicationResponse {
  query: Record<string, any>;
  matches_found: number;
  candidates: DuplicateCandidate[];
}

export async function fetchBeneficiary360(
  token: string,
  citizenId: string
): Promise<Beneficiary360Data> {
  const res = await fetch(`http://localhost:8000/api/v1/beneficiary/360/${citizenId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch Beneficiary 360 profile');
  }
  return res.json();
}

export async function searchDeduplication(
  token: string,
  payload: { query_name?: string; phone?: string; national_id_hash?: string }
): Promise<DeduplicationResponse> {
  const res = await fetch('http://localhost:8000/api/v1/beneficiary/deduplicate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error('Failed to execute deduplication search');
  }
  return res.json();
}
