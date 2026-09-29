import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_otp_flow(client: AsyncClient):
    # 1. Request OTP
    phone = "+94771234567"
    resp = await client.post("/api/v1/auth/request-otp", json={"identifier": phone})
    assert resp.status_code == 200
    data = resp.json()
    assert "Verification code sent" in data["message"]
    demo_code = data["demo_code"]

    # 2. Verify with invalid code
    bad_resp = await client.post("/api/v1/auth/verify-otp", json={"identifier": phone, "code": "000000"})
    assert bad_resp.status_code == 400

    # 3. Verify with correct code
    good_resp = await client.post("/api/v1/auth/verify-otp", json={"identifier": phone, "code": demo_code})
    assert good_resp.status_code == 200
    token_data = good_resp.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    token = token_data["access_token"]

    # 4. Access protected me endpoint
    me_resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    user_info = me_resp.json()
    assert user_info["phone"] == phone
    assert user_info["is_phone_verified"] is True
