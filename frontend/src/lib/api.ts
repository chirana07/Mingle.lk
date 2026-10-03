import {
  UserProfile,
  DiscoveryProfileItem,
  ConnectionCard,
  ConnectionRequestItem,
  MatchItem,
  ConversationSummaryItem,
  MessageItem,
  DateRecommendation,
  DatePlanItem,
  AdminMetrics,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("katha_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("katha_token", token);
      } else {
        localStorage.removeItem("katha_token");
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("katha_token");
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errDetail = "API request failed";
      try {
        const errorJson = await response.json();
        errDetail = errorJson.detail || errDetail;
      } catch (e) {
        // fallback
      }
      throw new Error(errDetail);
    }

    return response.json();
  }

  // --- Auth ---
  async requestOtp(identifier: string): Promise<{ message: string; demo_code?: string }> {
    return this.request("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ identifier }),
    });
  }

  async verifyOtp(identifier: string, code: string): Promise<{ access_token: string; user_id: string; role: string; has_profile: boolean }> {
    const res = await this.request<{ access_token: string; user_id: string; role: string; has_profile: boolean }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ identifier, code }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<any> {
    return this.request("/auth/me");
  }

  // --- Profiles ---
  async getMyProfile(): Promise<UserProfile | null> {
    return this.request("/profiles/me");
  }

  async updateMyProfile(data: any): Promise<UserProfile> {
    return this.request("/profiles/me", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePrivacySettings(discoveryEnabled?: boolean, showNeighborhoodOnly?: boolean): Promise<any> {
    return this.request("/profiles/me/privacy", {
      method: "PATCH",
      body: JSON.stringify({
        discovery_enabled: discoveryEnabled,
        show_neighborhood_only: showNeighborhoodOnly,
      }),
    });
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.request(`/profiles/${userId}`);
  }


  // --- Discovery ---
  async getDiscoveryFeed(city?: string, intent?: string): Promise<DiscoveryProfileItem[]> {
    const params = new URLSearchParams();
    if (city && city !== "all") params.append("city", city);
    if (intent && intent !== "all") params.append("intent", intent);
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/discovery${query}`);
  }

  // --- Connection Cards ---
  async getConnectionCards(): Promise<ConnectionCard[]> {
    return this.request("/cards");
  }

  async getMyCardAnswers(): Promise<any[]> {
    return this.request("/cards/my-answers");
  }

  async submitCardAnswer(cardId: string, selectedOptionKey: string, comment?: string): Promise<any> {
    return this.request("/cards/answer", {
      method: "POST",
      body: JSON.stringify({
        card_id: cardId,
        selected_option_key: selectedOptionKey,
        comment,
      }),
    });
  }

  async compareCards(targetUserId: string): Promise<any[]> {
    return this.request(`/cards/compare/${targetUserId}`);
  }

  // --- Connections & Matches ---
  async sendConnectionRequest(data: { receiver_id: string; card_id?: string; card_option_key?: string; intro_note?: string }): Promise<any> {
    return this.request("/connections/request", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getReceivedRequests(): Promise<ConnectionRequestItem[]> {
    return this.request("/connections/received");
  }

  async acceptConnection(requestId: string): Promise<{ status: string; message: string; match_id: string }> {
    return this.request(`/connections/${requestId}/accept`, {
      method: "POST",
    });
  }

  async getMatches(): Promise<MatchItem[]> {
    return this.request("/connections/matches");
  }

  // --- Chat ---
  async getConversations(): Promise<ConversationSummaryItem[]> {
    return this.request("/chat/conversations");
  }

  async getMessages(conversationId: string): Promise<MessageItem[]> {
    return this.request(`/chat/conversations/${conversationId}/messages`);
  }

  async sendMessage(conversationId: string, content: string): Promise<MessageItem> {
    return this.request(`/chat/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  getWebSocketUrl(conversationId: string): string {
    const token = this.getToken() || "";
    let wsProto = "ws:";
    if (typeof window !== "undefined") {
      wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
    }
    let host = process.env.NEXT_PUBLIC_API_HOST;
    if (!host && process.env.NEXT_PUBLIC_API_URL) {
      try {
        const parsed = new URL(process.env.NEXT_PUBLIC_API_URL);
        host = parsed.host;
      } catch (e) {}
    }
    if (!host) {
      host = "localhost:8000";
    }
    return `${wsProto}//${host}/api/v1/chat/ws/${conversationId}?token=${encodeURIComponent(token)}`;
  }


  // --- Date Mode & Safety ---
  async getDateRecommendations(city?: string, budget?: string): Promise<DateRecommendation[]> {
    const params = new URLSearchParams();
    if (city && city !== "all") params.append("city", city);
    if (budget && budget !== "all") params.append("budget", budget);
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/dates/recommendations${query}`);
  }

  async proposeDate(data: {
    match_id: string;
    category: string;
    venue_name: string;
    neighborhood: string;
    budget_bracket: string;
    invitation_note?: string;
  }): Promise<DatePlanItem> {
    return this.request("/dates/propose", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getLatestDatePlan(matchId: string): Promise<DatePlanItem | null> {
    return this.request(`/dates/match/${matchId}`);
  }

  async respondDatePlan(datePlanId: string, accept: boolean): Promise<DatePlanItem> {
    return this.request(`/dates/${datePlanId}/respond?accept=${accept}`, {
      method: "POST",
    });
  }

  async createSafetyPlan(datePlanId: string, data: {
    trusted_contact_name: string;
    trusted_contact_phone: string;
    emergency_notes?: string;
  }): Promise<any> {
    return this.request(`/dates/${datePlanId}/safety-plan`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async submitDateFeedback(datePlanId: string, data: {
    met_in_person: boolean;
    accurate_profile: boolean;
    comfort_rating: number;
    would_meet_again: boolean;
    private_safety_notes?: string;
  }): Promise<any> {
    return this.request(`/dates/${datePlanId}/feedback`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // --- Safety ---
  async reportUser(reportedId: string, category: string, details: string): Promise<any> {
    return this.request("/safety/report", {
      method: "POST",
      body: JSON.stringify({
        reported_id: reportedId,
        category,
        details,
      }),
    });
  }

  async blockUser(blockedId: string): Promise<any> {
    return this.request("/safety/block", {
      method: "POST",
      body: JSON.stringify({ blocked_id: blockedId }),
    });
  }

  // --- Admin ---
  async getAdminMetrics(): Promise<AdminMetrics> {
    return this.request("/admin/metrics");
  }

  async getAdminReports(): Promise<any[]> {
    return this.request("/admin/reports");
  }

  async updateAdminReport(reportId: string, status: string, adminNotes?: string): Promise<any> {
    return this.request(`/admin/reports/${reportId}`, {
      method: "PATCH",
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    });
  }

  async getAdminUsers(): Promise<any[]> {
    return this.request("/admin/users");
  }

  async updateAdminUser(userId: string, data: { status?: string; role?: string; is_selfie_verified?: boolean }): Promise<any> {
    return this.request(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
