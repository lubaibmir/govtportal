import logging
from typing import Dict, List, Any, Optional
from pydantic import BaseModel

logger = logging.getLogger("mahasetu.workflow_engine")

class WorkflowRule(BaseModel):
    rule_id: str
    service_id: str
    service_name: str
    department_id: str
    name: str
    description: str
    enabled: bool
    sla_hours: int
    conditions: Dict[str, Any]
    target_action: str  # e.g., "AUTO_APPROVE", "FAST_TRACK_REVIEW"

class WorkflowEvaluationResult(BaseModel):
    rule_id: str
    rule_name: str
    triggered: bool
    target_status: str
    reason: str

DEFAULT_RULES: List[WorkflowRule] = [
    WorkflowRule(
        rule_id="rule_ind_msme_auto_approval",
        service_id="srv_ind_biz_license",
        service_name="Small Scale Business License",
        department_id="dept_industries",
        name="MSME Micro-Enterprise Income Auto-Approval",
        description="Automatically approve Small Scale Business License if verified annual income is <= threshold with verified Revenue certificate.",
        enabled=True,
        sla_hours=48,
        conditions={
            "max_annual_income": 500000.0,
            "require_verified_income_cert": True
        },
        target_action="AUTO_APPROVE"
    ),
    WorkflowRule(
        rule_id="rule_msins_grant_auto_approval",
        service_id="srv_msins_seed_grant",
        service_name="MSInS Startup Innovation Seed Grant",
        department_id="dept_skills",
        name="MSInS Tier-1 Innovator Fast-Track Approval",
        description="Automatically approve seed grants for certified innovators with MSBTE/NSQF Grade A/Distinction and verified low/medium annual income.",
        enabled=True,
        sla_hours=48,
        conditions={
            "max_annual_income": 800000.0,
            "allowed_skill_grades": ["A", "DISTINCTION", "FIRST_CLASS", "O"],
            "require_both_sources": True
        },
        target_action="AUTO_APPROVE"
    ),
    WorkflowRule(
        rule_id="rule_edu_degree_fast_track",
        service_id="srv_edu_degree_verify",
        service_name="Higher Education Degree Verification",
        department_id="dept_education",
        name="State University Automated Verification",
        description="Verify degrees instantly if university digital transcript matches national depository hash.",
        enabled=True,
        sla_hours=24,
        conditions={
            "require_digital_registry_match": True
        },
        target_action="AUTO_APPROVE"
    )
]

class WorkflowRulesRegistry:
    def __init__(self):
        self._rules: Dict[str, WorkflowRule] = {r.rule_id: r.model_copy(deep=True) for r in DEFAULT_RULES}

    def get_all_rules(self) -> List[WorkflowRule]:
        return list(self._rules.values())

    def get_rule(self, rule_id: str) -> Optional[WorkflowRule]:
        return self._rules.get(rule_id)

    def update_rule(self, rule_id: str, updates: Dict[str, Any]) -> Optional[WorkflowRule]:
        rule = self._rules.get(rule_id)
        if not rule:
            return None
        
        if "enabled" in updates and updates["enabled"] is not None:
            rule.enabled = updates["enabled"]
        if "sla_hours" in updates and updates["sla_hours"] is not None:
            rule.sla_hours = int(updates["sla_hours"])
        if "conditions" in updates and isinstance(updates["conditions"], dict):
            rule.conditions.update(updates["conditions"])
        
        self._rules[rule_id] = rule
        logger.info(f"Updated Workflow Rule: {rule_id} -> enabled={rule.enabled}, sla_hours={rule.sla_hours}")
        return rule

    def reset_defaults(self) -> List[WorkflowRule]:
        self._rules = {r.rule_id: r.model_copy(deep=True) for r in DEFAULT_RULES}
        return list(self._rules.values())

    def evaluate_application(self, service_id: str, app_data: Dict[str, Any]) -> Optional[WorkflowEvaluationResult]:
        """Evaluates whether an incoming application matches any auto-approval or routing policy rules"""
        for rule in self._rules.values():
            if rule.service_id != service_id or not rule.enabled:
                continue

            # 1. Evaluate MSME Business License Rule
            if rule.rule_id == "rule_ind_msme_auto_approval":
                verified_income = app_data.get("verified_annual_income") or app_data.get("annual_turnover") or (app_data.get("revenue_verification") or {}).get("annual_income")
                has_cert = bool(app_data.get("income_certificate_number") or app_data.get("revenue_verification"))
                
                max_income = rule.conditions.get("max_annual_income", 500000.0)
                
                if verified_income is not None:
                    try:
                        income_val = float(verified_income)
                        if income_val <= max_income and (not rule.conditions.get("require_verified_income_cert") or has_cert):
                            return WorkflowEvaluationResult(
                                rule_id=rule.rule_id,
                                rule_name=rule.name,
                                triggered=True,
                                target_status="APPROVED",
                                reason=f"Auto-approved by Policy Rule '{rule.name}': Verified Income (₹{income_val:,.2f}) <= threshold (₹{max_income:,.2f}) with verified Revenue Certificate."
                            )
                    except (ValueError, TypeError):
                        pass

            # 2. Evaluate MSInS Seed Grant Rule
            elif rule.rule_id == "rule_msins_grant_auto_approval":
                rev_ver = app_data.get("revenue_verification") or {}
                skills_ver = app_data.get("skills_verification") or {}

                rev_income = rev_ver.get("annual_income")
                skill_grade = str(skills_ver.get("grade", "")).upper()

                max_income = rule.conditions.get("max_annual_income", 800000.0)
                allowed_grades = [g.upper() for g in rule.conditions.get("allowed_skill_grades", ["A", "DISTINCTION", "FIRST_CLASS"])]

                if rev_income is not None and skill_grade:
                    try:
                        income_val = float(rev_income)
                        grade_matches = any(g in skill_grade for g in allowed_grades)
                        if income_val <= max_income and grade_matches:
                            return WorkflowEvaluationResult(
                                rule_id=rule.rule_id,
                                rule_name=rule.name,
                                triggered=True,
                                target_status="APPROVED",
                                reason=f"Auto-approved by Policy Rule '{rule.name}': Verified Income (₹{income_val:,.2f}) <= ₹{max_income:,.2f} and MSBTE Skill Grade '{skill_grade}' qualifies for instant disbursement."
                            )
                    except (ValueError, TypeError):
                        pass

        return None

workflow_registry = WorkflowRulesRegistry()
