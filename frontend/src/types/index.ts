export type Role = 'CITIZEN' | 'DEPARTMENT_OFFICER' | 'DEPARTMENT_ADMIN' | 'SYSTEM_ADMIN';

export interface CitizenProfileData {
  national_id_hash: string;
  date_of_birth: string;
  gender: string;
  address_line1: string;
  city: string;
  district: string;
  pincode: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: Role;
  department_id?: string | null;
  citizen_profile?: CitizenProfileData | null;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  contact_email: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
}

export interface Service {
  id: string;
  department_id: string;
  name: string;
  code: string;
  description: string;
  required_data_sources: Array<{
    department_id: string;
    data_type: string;
    fields: string[];
  }>;
  status: 'ACTIVE' | 'DRAFT';
}

export interface HealthStatus {
  platform: string;
  status: 'HEALTHY' | 'DEGRADED';
  environment: string;
  timestamp: string;
  components: {
    database: string;
    redis: string;
    adapters: Record<string, string>;
  };
}
