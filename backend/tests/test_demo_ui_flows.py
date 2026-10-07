"""Exercise the actual example-data generator against an isolated database."""
import importlib
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker


@pytest.mark.asyncio
async def test_seeded_profiles_chats_filters_and_decline(client, db_session, monkeypatch):
    seed = importlib.import_module("backend.seed.seed_data")
    main = importlib.import_module("backend.app.main")
    sessions = async_sessionmaker(db_session.bind, expire_on_commit=False)
    monkeypatch.setattr(seed, "AsyncSessionLocal", sessions)
    monkeypatch.setattr(main, "AsyncSessionLocal", sessions)
    monkeypatch.setattr(seed, "init_db", AsyncMock())
    await seed.seed_profiles(12)
    # Re-running must preserve existing examples and conversations.
    await seed.seed_profiles(12)
    login = await client.post("/api/v1/auth/verify-otp", json={"identifier": "+94771234567", "code": "123456"})
    assert login.status_code == 200
    headers = {"Authorization": "Bearer " + login.json()["access_token"]}
    profile = (await client.get("/api/v1/profiles/me", headers=headers)).json()
    assert profile["first_name"] == "Senuri"
    feed = await client.get("/api/v1/discovery", headers=headers)
    assert feed.status_code == 200 and feed.json()
    for item in feed.json():
        public = await client.get("/api/v1/profiles/" + item["profile"]["user_id"], headers=headers)
        assert public.status_code == 200
        assert public.json()["photos"]
        assert public.json()["first_name"] != "Mingle Admin"
    city = feed.json()[0]["profile"]["city"]
    filtered = await client.get("/api/v1/discovery", params={"city": city}, headers=headers)
    assert filtered.status_code == 200
    assert all(item["profile"]["city"] == city for item in filtered.json())
    conversations = (await client.get("/api/v1/chat/conversations", headers=headers)).json()
    assert len(conversations) == 2
    for conversation in conversations:
        endpoint = "/api/v1/chat/conversations/" + conversation["id"] + "/messages"
        assert (await client.get(endpoint, headers=headers)).status_code == 200
        sent = await client.post(endpoint, json={"content": "Demo conversation test"}, headers=headers)
        assert sent.status_code == 200 and sent.json()["is_mine"]
        history = (await client.get(endpoint, headers=headers)).json()
        assert history[-1]["content"] == "Demo conversation test"
    requests = (await client.get("/api/v1/connections/received", headers=headers)).json()
    assert len(requests) == 1
    declined = await client.post("/api/v1/connections/" + requests[0]["id"] + "/decline", headers=headers)
    assert declined.status_code == 200
    assert declined.json()["status"] == "rejected"
    assert (await client.get("/api/v1/connections/received", headers=headers)).json() == []
