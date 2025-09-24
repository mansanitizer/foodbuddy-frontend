export const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.foodbuddy.iarm.me";

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }
  return undefined as unknown as T;
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

// Like and Comment API functions
export interface LikeSummary {
  meal_id: number;
  likes_count: number;
  liked_by_me: boolean;
}

export interface CommentPublic {
  id: number;
  meal_id: number;
  user_id: number;
  comment: string;
  created_at: string;
}

export interface CommentCreate {
  comment: string;
}

// Like a meal
export async function likeMeal(mealId: number): Promise<LikeSummary> {
  return api<LikeSummary>(`/meals/${mealId}/like`, { method: 'POST' });
}

// Unlike a meal
export async function unlikeMeal(mealId: number): Promise<LikeSummary> {
  return api<LikeSummary>(`/meals/${mealId}/like`, { method: 'DELETE' });
}

// Get like status for a meal
export async function getLikeStatus(mealId: number): Promise<LikeSummary> {
  return api<LikeSummary>(`/meals/${mealId}/likes`);
}

// Get comments for a meal
export async function getComments(mealId: number): Promise<CommentPublic[]> {
  return api<CommentPublic[]>(`/meals/${mealId}/comments`);
}

// Post a comment on a meal
export async function postComment(mealId: number, comment: string): Promise<CommentPublic> {
  return api<CommentPublic>(`/meals/${mealId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ comment })
  });
}

