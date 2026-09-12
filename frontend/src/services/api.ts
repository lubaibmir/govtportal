import { HealthStatus } from '../types';

const API_BASE_URL = '/api/v1';

export async function fetchHealthStatus(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return {
      platform: "MahaSetu Interoperability Platform",
      status: "DEGRADED",
      environment: "development",
      timestamp: new Date().toISOString(),
      components: {
        database: "MOCK_MODE",
        redis: "MOCK_MODE",
        adapters: {
          revenue_adapter: "ONLINE",
          education_adapter: "ONLINE",
          industries_adapter: "ONLINE"
        }
      }
    };
  }
}
