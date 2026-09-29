import pytest
from datetime import date
from backend.app.models.profile import Profile
from backend.app.models.card import ConnectionCard
from backend.app.services.matching_service import MatchingService


def test_explainable_matching_algorithm():
    # Setup test profiles
    p1 = Profile(
        first_name="Senuri",
        birth_date=date(2001, 5, 14),
        gender="woman",
        city="Colombo",
        neighborhood="Colombo 05",
        relationship_intent="Dating intentionally",
        communication_style="Frequent texter",
        lifestyle_pace="Cafe explorer & beach sunsets",
        interests=["Specialty Coffee", "Surfing", "Literature"],
    )

    p2_compatible = Profile(
        first_name="Dinuk",
        birth_date=date(1999, 8, 20),
        gender="man",
        city="Colombo",
        neighborhood="Colombo 05",
        relationship_intent="Dating intentionally",
        communication_style="Frequent texter",
        lifestyle_pace="Cafe explorer & beach sunsets",
        interests=["Specialty Coffee", "Surfing", "Wildlife"],
    )

    p3_divergent = Profile(
        first_name="Kasun",
        birth_date=date(1995, 3, 10),
        gender="man",
        city="Kandy",
        neighborhood="Peradeniya",
        relationship_intent="Casual dating",
        communication_style="In-person preferred",
        lifestyle_pace="Night owl & gigs",
        interests=["Nightclubs", "Gaming"],
    )

    card1 = ConnectionCard(
        id="card-1",
        category="Lifestyle",
        question="Pick your ideal Saturday in Sri Lanka:",
        options=[
            {"key": "A", "label": "Beach sunset"},
            {"key": "B", "label": "Cozy cafe"}
        ]
    )
    cards_meta = {"card-1": card1}

    # Case 1: High compatibility
    cards_p1 = {"card-1": "A"}
    cards_p2 = {"card-1": "A"}

    score_high, reasons_high, shared_ints, comps, starters = MatchingService.calculate_compatibility(
        p1, p2_compatible, cards_p1, cards_p2, cards_meta
    )

    assert score_high >= 80.0
    assert any("Aligned intention" in r for r in reasons_high)
    assert any("Same local neighborhood" in r for r in reasons_high)
    assert any("Specialty Coffee" in r for r in reasons_high)
    assert len(comps) == 1
    assert comps[0].is_identical is True
    assert len(starters) >= 1

    # Case 2: Divergent profiles
    cards_p3 = {"card-1": "B"}
    score_low, reasons_low, shared_p3, comps_p3, starters_p3 = MatchingService.calculate_compatibility(
        p1, p3_divergent, cards_p1, cards_p3, cards_meta
    )

    assert score_low < score_high
    assert not any("Aligned intention" in r for r in reasons_low)
