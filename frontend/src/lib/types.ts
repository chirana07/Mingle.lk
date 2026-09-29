export interface ProfilePhoto {
  id: string;
  url: string;
  caption?: string;
  is_primary: boolean;
  order_index: number;
}

export interface PromptAnswer {
  id: string;
  prompt_key: string;
  prompt_question: string;
  answer_text: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  birth_date: string;
  age: number;
  gender: string;
  looking_for_gender: string;
  city: string;
  neighborhood: string;
  bio?: string;
  occupation?: string;
  education?: string;
  relationship_intent: string;
  communication_style: string;
  lifestyle_pace: string;
  interests: string[];
  languages: string[];
  photos: ProfilePhoto[];
  prompt_answers: PromptAnswer[];
  is_phone_verified: boolean;
  is_email_verified: boolean;
  is_selfie_verified: boolean;
  is_profile_completed: boolean;
}

export interface CardOption {
  key: string;
  label: string;
  emoji?: string;
}

export interface ConnectionCard {
  id: string;
  category: string;
  question: string;
  subtext?: string;
  options: CardOption[];
  order_index: number;
}

export interface CardComparison {
  card_id: string;
  question: string;
  user_choice_key: string;
  user_choice_label: string;
  target_choice_key: string;
  target_choice_label: string;
  is_identical: boolean;
  conversation_starter: string;
}

export interface DiscoveryProfileItem {
  profile: UserProfile;
  compatibility_score: number;
  compatibility_level: string;
  match_reasons: string[];
  shared_interests: string[];
  card_comparisons: CardComparison[];
  suggested_starters: string[];
}

export interface ConnectionRequestItem {
  id: string;
  sender_id: string;
  receiver_id: string;
  card_id?: string;
  card_option_key?: string;
  prompt_key?: string;
  intro_note?: string;
  status: string;
  created_at: string;
  sender_profile?: UserProfile;
}

export interface MatchItem {
  id: string;
  compatibility_score: number;
  match_reasons: string[];
  created_at: string;
  target_profile: UserProfile;
  conversation_id?: string;
  suggested_starters: string[];
}

export interface MessageItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
  is_mine: boolean;
}

export interface ConversationSummaryItem {
  id: string;
  match_id: string;
  target_profile: UserProfile;
  last_message?: MessageItem;
  unread_count: number;
  updated_at: string;
  suggested_starters: string[];
}

export interface DateRecommendation {
  category: string;
  venue_name: string;
  neighborhood: string;
  city: string;
  budget_bracket: string;
  vibe_description: string;
  safety_highlights: string;
  why_recommended: string;
}

export interface DatePlanItem {
  id: string;
  match_id: string;
  proposed_by_id: string;
  category: string;
  venue_name: string;
  neighborhood: string;
  budget_bracket: string;
  scheduled_time?: string;
  status: string;
  invitation_note?: string;
  created_at: string;
  is_proposed_by_me: boolean;
}

export interface AdminMetrics {
  total_users: number;
  active_users: number;
  verified_users: number;
  matches_created: number;
  conversations_started: number;
  dates_planned: number;
  reports_pending: number;
  match_to_conversation_rate: number;
  conversation_to_date_rate: number;
  safety_incident_rate: number;
}
