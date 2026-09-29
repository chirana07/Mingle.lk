import pytest
from backend.app.services.chat_service import ChatService


def test_anti_scam_detection():
    # Innocent Sri Lankan conversation
    innocent_text = "Hey! Would love to grab a coffee at Barefoot Garden Cafe this Saturday."
    flagged, reason = ChatService.scan_for_safety(innocent_text)
    assert flagged is False
    assert reason is None

    # Suspicious banking / wire transfer solicitation
    scam_wire = "Hey, my card got blocked, could you do a quick bank transfer to my commercial bank account?"
    flagged, reason = ChatService.scan_for_safety(scam_wire)
    assert flagged is True
    assert "solicitation" in reason

    # Crypto / USDT solicitation
    scam_crypto = "I make 50,000 LKR daily trading Binance USDT crypto, let me teach you."
    flagged, reason = ChatService.scan_for_safety(scam_crypto)
    assert flagged is True

    # Telegram redirect solicitation
    scam_telegram = "I don't use this app much, telegram me @cryptoqueen99 right now."
    flagged, reason = ChatService.scan_for_safety(scam_telegram)
    assert flagged is True
