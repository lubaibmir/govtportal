import pytest
from app.adapters.skills import SkillsAdapter
from app.schemas.canonical import CanonicalDataMapper, SkillCertificateCanonical

@pytest.mark.asyncio
async def test_skills_adapter_and_canonical_mapping():
    adapter = SkillsAdapter()
    assert adapter.department_id == "dept_skills"

    raw_skill = await adapter.fetch_department_data(
        citizen_id="9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        data_type="SKILL_CERTIFICATE",
        consent_token="cnt_token_test_123"
    )

    assert raw_skill["trainee_id"] == "MH-SKILL-2024-88319"
    assert raw_skill["verification_status"] == "VERIFIED_VALID"

    canonical = CanonicalDataMapper.transform_skill_certificate(raw_skill)
    assert isinstance(canonical, SkillCertificateCanonical)
    assert canonical.trainee_id == "MH-SKILL-2024-88319"
    assert canonical.certification_level == "NSQF Level 6"
    assert canonical.grade == "DISTINCTION"
    assert "MSBTE" in canonical.issuing_board
