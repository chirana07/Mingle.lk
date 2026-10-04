import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_subscription_plans_and_simulation(client: AsyncClient):
    # Login User (Senuri)
    r1 = await client.post("/api/v1/auth/verify-otp", json={"identifier": "+94771111111", "code": "123456"})
    t1 = r1.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {t1}"}

    # Create profile
    p1_data = {
        "first_name": "Senuri",
        "birth_date": "2001-05-14",
        "gender": "woman",
        "city": "Colombo",
        "neighborhood": "Colombo 05",
        "bio": "Designer in Colombo",
        "relationship_intent": "Dating intentionally",
        "communication_style": "Frequent texter",
        "lifestyle_pace": "Cafe explorer",
        "interests": ["Coffee", "Art"],
        "languages": ["English", "Sinhala"],
        "photos": [{"url": "https://example.com/p1.jpg", "is_primary": True}],
        "prompts": [],
    }
    await client.post("/api/v1/profiles/me", json=p1_data, headers=auth_headers)

    # 1. Fetch available plans
    plans_res = await client.get("/api/v1/subscriptions/plans")
    assert plans_res.status_code == 200
    plans = plans_res.json()
    assert len(plans) == 3
    plan_ids = [p["id"] for p in plans]
    assert "katha_plus_weekly" in plan_ids
    assert "katha_plus_monthly_special" in plan_ids
    assert "katha_plus_monthly" in plan_ids

    # 2. Check initial status (free)
    status_res = await client.get("/api/v1/subscriptions/status", headers=auth_headers)
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["is_katha_plus"] is False
    assert status_data["subscription_tier"] == "free"

    # 3. PayHere Checkout Parameters Generation
    checkout_res = await client.post(
        "/api/v1/subscriptions/checkout",
        headers=auth_headers,
        json={"plan_id": "katha_plus_monthly_special", "spotlight_district": "Colombo", "payment_method": "payhere"},
    )
    assert checkout_res.status_code == 200
    checkout_data = checkout_res.json()
    assert "sandbox.payhere.lk" in checkout_data["action_url"]
    assert checkout_data["currency"] == "LKR"
    assert checkout_data["amount"] == "990.00"
    assert "hash" in checkout_data and len(checkout_data["hash"]) == 32

    # 4. Sandbox Payment Simulation (Instant Activation)
    sim_res = await client.post(
        "/api/v1/subscriptions/simulate-payment",
        headers=auth_headers,
        json={"plan_id": "katha_plus_monthly_special", "spotlight_district": "Colombo 07", "payment_method": "payhere_simulation"},
    )
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["is_katha_plus"] is True
    assert sim_data["subscription_tier"] == "katha_plus_monthly_special"
    assert sim_data["spotlight_district"] == "Colombo 07"
    assert sim_data["extra_cards_count"] >= 5
    assert sim_data["days_remaining"] == 30

    # 5. Verify Updated Status
    status_res2 = await client.get("/api/v1/subscriptions/status", headers=auth_headers)
    assert status_res2.status_code == 200
    assert status_res2.json()["is_katha_plus"] is True

    # 6. Change spotlight district
    spot_res = await client.post(
        "/api/v1/subscriptions/set-spotlight-district",
        headers=auth_headers,
        json={"district": "Kandy"},
    )
    assert spot_res.status_code == 200
    assert spot_res.json()["spotlight_district"] == "Kandy"

    # 7. Card Responders Endpoint
    resp_res = await client.get("/api/v1/subscriptions/card-responders", headers=auth_headers)
    assert resp_res.status_code == 200
    assert isinstance(resp_res.json(), list)
