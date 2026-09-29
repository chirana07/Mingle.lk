from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class ConnectionCardOption(BaseModel):
    key: str
    label: str
    emoji: Optional[str] = None


class ConnectionCardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    category: str
    question: str
    subtext: Optional[str] = None
    options: List[Dict[str, Any]]
    order_index: int


class CardAnswerSubmit(BaseModel):
    card_id: str
    selected_option_key: str
    comment: Optional[str] = None


class CardAnswerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    card_id: str
    selected_option_key: str
    comment: Optional[str] = None
    question: Optional[str] = None
    selected_option_label: Optional[str] = None


class CardComparisonResponse(BaseModel):
    card_id: str
    question: str
    user_choice_key: str
    user_choice_label: str
    target_choice_key: str
    target_choice_label: str
    is_identical: bool
    conversation_starter: str
