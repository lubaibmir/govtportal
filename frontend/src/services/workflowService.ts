export interface WorkflowRule {
  rule_id: string;
  service_id: string;
  service_name: string;
  department_id: string;
  name: string;
  description: string;
  enabled: boolean;
  sla_hours: number;
  conditions: Record<string, any>;
  target_action: string;
}

export interface RuleUpdatePayload {
  enabled?: boolean;
  sla_hours?: number;
  conditions?: Record<string, any>;
}

export async function fetchWorkflowRules(): Promise<WorkflowRule[]> {
  const res = await fetch('http://localhost:8000/api/v1/workflow/rules');
  if (!res.ok) {
    throw new Error('Failed to fetch workflow rules');
  }
  return res.json();
}

export async function updateWorkflowRule(
  token: string,
  ruleId: string,
  payload: RuleUpdatePayload
): Promise<WorkflowRule> {
  const res = await fetch(`http://localhost:8000/api/v1/workflow/rules/${ruleId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update workflow rule');
  }
  return res.json();
}

export async function resetWorkflowRules(token: string): Promise<WorkflowRule[]> {
  const res = await fetch('http://localhost:8000/api/v1/workflow/rules/reset', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to reset workflow rules');
  }
  return res.json();
}
