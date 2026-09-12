import { Department, Service } from '../types';

const API_BASE_URL = '/api/v1';

export async function fetchDepartments(): Promise<Department[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/departments`);
    if (!response.ok) throw new Error('Failed to fetch departments');
    return await response.json();
  } catch (error) {
    return [
      {
        id: 'dept_revenue',
        code: 'REV',
        name: 'Revenue Department',
        description: 'Land records, income certificates, residence proofs',
        contact_email: 'nodal.revenue@maharashtra.gov.in',
        status: 'ACTIVE'
      },
      {
        id: 'dept_education',
        code: 'EDU',
        name: 'Education Department',
        description: 'Student records, marksheets, degree verifications',
        contact_email: 'nodal.education@maharashtra.gov.in',
        status: 'ACTIVE'
      },
      {
        id: 'dept_industries',
        code: 'IND',
        name: 'Industries Department',
        description: 'Business registrations, industrial licenses, MSME NOCs',
        contact_email: 'nodal.industries@maharashtra.gov.in',
        status: 'ACTIVE'
      }
    ];
  }
}

export async function fetchServices(departmentId?: string): Promise<Service[]> {
  try {
    const url = departmentId
      ? `${API_BASE_URL}/services?department_id=${departmentId}`
      : `${API_BASE_URL}/services`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch services');
    return await response.json();
  } catch (error) {
    return [
      {
        id: 'srv_ind_biz_license',
        department_id: 'dept_industries',
        name: 'Small Scale Business License',
        code: 'IND-BIZ-01',
        description: 'Issuance of industrial operational license for small scale enterprises requiring income verification.',
        required_data_sources: [
          {
            department_id: 'dept_revenue',
            data_type: 'INCOME_CERTIFICATE',
            fields: ['annual_income', 'certificate_no', 'validity_until']
          }
        ],
        status: 'ACTIVE'
      },
      {
        id: 'srv_rev_income_cert',
        department_id: 'dept_revenue',
        name: 'Income Certificate Verification',
        code: 'REV-INC-01',
        description: 'Official state verification of annual household income certificate.',
        required_data_sources: [],
        status: 'ACTIVE'
      },
      {
        id: 'srv_edu_degree_verify',
        department_id: 'dept_education',
        name: 'Higher Education Degree Verification',
        code: 'EDU-DEG-01',
        description: 'Verification of university degree certificate and student marksheet.',
        required_data_sources: [],
        status: 'ACTIVE'
      }
    ];
  }
}
