import pytest
from httpx import AsyncClient
from datetime import date


@pytest.mark.asyncio
async def test_connection_and_date_flow(client: AsyncClient):
    # 1. Login User 1 (Senuri)
    r1 = await client.post("/api/v1/auth/verify-otp", json={"identifier": "+94771111111", "code": "123456"})
    t1 = r1.json()["access_token"]
    u1_id = r1.json()["user_id"]

    # Create profile for User 1
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
        "prompts": []
    }
    await client.post("/api/v1/profiles/me", json=p1_data, headers={"Authorization": f"Bearer {t1}"})

    # 2. Login User 2 (Dinuk)
    r2 = await client.post("/api/v1/auth/verify-otp", json={"identifier": "+94772222222", "code": "123456"})
    t2 = r2.json()["access_token"]
    u2_id = r2.json()["user_id"]

    # Create profile for User 2
    p2_data = {
        "first_name": "Dinuk",
        "birth_date": "1999-08-20",
        "gender": "man",
        "city": "Colombo",
        "neighborhood": "Colombo 05",
        "bio": "Engineer in Colombo",
        "relationship_intent": "Dating intentionally",
        "communication_style": "Frequent texter",
        "lifestyle_pace": "Cafe explorer",
        "interests": ["Coffee", "Surfing"],
        "languages": ["English", "Sinhala"],
        "photos": [{"url": "https://example.com/p2.jpg", "is_primary": True}],
        "prompts": []
    }
    await client.post("/api/v1/profiles/me", json=p2_data, headers={"Authorization": f"Bearer {t2}"})

    # 3. User 1 sends connection request to User 2
    req_resp = await client.post(
        "/api/v1/connections/request",
        json={
            "receiver_id": u2_id,
            "intro_note": "Hey Dinuk, would love to connect!"
        },
        headers={"Authorization": f"Bearer {t1}"}
    )
    assert req_resp.status_code == 200
    assert req_resp.json()["status"] == "pending"
    req_id = req_resp.json()["request_id"]

    # 4. User 2 checks received requests
    rec_resp = await client.get("/api/v1/connections/received", headers={"Authorization": f"Bearer {t2}"})
    assert rec_resp.status_code == 200
    received_list = rec_resp.json()
    assert len(received_list) == 1
    assert received_list[0]["id"] == req_id

    # 5. User 2 accepts connection request -> forms Match!
    accept_resp = await client.post(
        f"/api/v1/connections/{req_id}/accept",
        headers={"Authorization": f"Bearer {t2}"}
    )
    assert accept_resp.status_code == 200
    assert accept_resp.json()["status"] == "matched"
    match_id = accept_resp.json()["match_id"]

    # 6. Both users see active match
    m_resp = await client.get("/api/v1/connections/matches", headers={"Authorization": f"Bearer {t1}"})
    assert m_resp.status_code == 200
    matches = m_resp.json()
    assert len(matches) == 1
    assert matches[0]["id"] == match_id
    conv_id = matches[0]["conversation_id"]
    assert conv_id is not None

    # 7. User 1 sends a message in chat
    msg_resp = await client.post(
        f"/api/v1/chat/conversations/{conv_id}/messages",
        json={"content": "Hey Dinuk, excited to connect! Shall we grab a coffee?"},
        headers={"Authorization": f"Bearer {t1}"}
    )
    assert msg_resp.status_code == 200
    assert msg_resp.json()["content"] == "Hey Dinuk, excited to connect! Shall we grab a coffee?"

    # 8. User 2 proposes a Date Plan
    date_resp = await client.post(
        "/api/v1/dates/propose",
        json={
            "match_id": match_id,
            "category": "Coffee & Walk",
            "venue_name": "Barefoot Garden Cafe",
            "neighborhood": "Colombo 03",
            "budget_bracket": "Under LKR 2,000",
            "invitation_note": "Let's check out the bookstore and courtyard!"
        },
        headers={"Authorization": f"Bearer {t2}"}
    )
    assert date_resp.status_code == 200
    date_plan_id = date_resp.json()["id"]
    assert date_resp.json()["status"] == "proposed"

    # 9. User 1 creates a private Safety Plan for this date
    safety_resp = await client.post(
        f"/api/v1/dates/{date_plan_id}/safety-plan",
        json={
            "trusted_contact_name": "Amaya Perera (Sister)",
            "trusted_contact_phone": "+94779876543",
            "emergency_notes": "Meeting Dinuk at Barefoot around 4:30pm"
        },
        headers={"Authorization": f"Bearer {t1}"}
    )
    assert safety_resp.status_code == 200
    assert safety_resp.json()["trusted_contact_name"] == "Amaya Perera (Sister)"
    assert safety_resp.json()["check_in_status"] == "pending"
