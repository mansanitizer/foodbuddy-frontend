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

// New Buddy System Types
export interface BuddyInfo {
  id: number;
  name?: string;
  email: string;
  age?: number;
  gender?: string;
  dietary_preferences?: string[];
  fitness_goals?: string[];
  activity_level?: string;
  daily_calorie_target?: number;
  tdee?: number;
}

export interface BuddyListResponse {
  buddies: BuddyInfo[];
  count: number;
}

export interface BuddyStatusResponse {
  is_buddy: boolean;
  buddy_count: number;
}

export interface RemoveBuddyRequest {
  buddy_id: number;
}

export interface PairingCodeResponse {
  code: string;
  expires_at: string;
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

// Buddy System API Functions
export async function getBuddies(): Promise<BuddyListResponse> {
  try {
    return await api<BuddyListResponse>('/pairing/buddies');
  } catch (error: any) {
    // Fallback for when backend doesn't support new buddy system yet
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      console.log('New buddy endpoints not available, using fallback');
      // Return empty buddy list for now
      return { buddies: [], count: 0 };
    }
    throw error;
  }
}

export async function getBuddyStatus(): Promise<BuddyStatusResponse> {
  try {
    return await api<BuddyStatusResponse>('/pairing/status');
  } catch (error: any) {
    // Fallback for when backend doesn't support new buddy system yet
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      console.log('New buddy status endpoint not available, checking old buddy_id');
      try {
        // Fallback to old API to check if user has a buddy
        const user = await api<{ id:number; email:string; name?:string; buddy_id?:number; tdee?:number; daily_calorie_target?:number }>('/users/me');
        return {
          is_buddy: !!user.buddy_id,
          buddy_count: user.buddy_id ? 1 : 0
        };
      } catch (fallbackError) {
        console.error('Fallback buddy check failed:', fallbackError);
        return { is_buddy: false, buddy_count: 0 };
      }
    }
    throw error;
  }
}

export async function removeBuddy(buddyId: number): Promise<void> {
  try {
    return await api<void>('/pairing/unpair', {
      method: 'POST',
      body: JSON.stringify({ buddy_id: buddyId })
    });
  } catch (error: any) {
    // Fallback for when backend doesn't support new buddy system yet
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      console.log('New remove buddy endpoint not available, using old unpair');
      // Fallback to old unpair endpoint (removes all buddies)
      return api<void>('/pairing/unpair', {
        method: 'POST'
      });
    }
    throw error;
  }
}

export async function generatePairingCode(): Promise<PairingCodeResponse> {
  try {
    return await api<PairingCodeResponse>('/pairing/generate', {
      method: 'POST'
    });
  } catch (error: any) {
    // Fallback for when backend doesn't support new buddy system yet
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      console.log('New generate pairing code endpoint not available, using old endpoint');
      // Fallback to old generate endpoint
      return api<PairingCodeResponse>('/pairing/generate', {
        method: 'POST'
      });
    }
    throw error;
  }
}

export async function acceptPairingCode(code: string): Promise<{ ok: boolean; message: string }> {
  try {
    return await api<{ ok: boolean; message: string }>('/pairing/accept', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  } catch (error: any) {
    // Fallback for when backend doesn't support new buddy system yet
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      console.log('New accept pairing code endpoint not available, using old endpoint');
      // Fallback to old accept endpoint
      await api('/pairing/accept', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      return { ok: true, message: 'Paired successfully!' };
    }
    throw error;
  }
}

// Enhanced Meal Analysis API Functions
import type { 
  Meal, 
  MealUploadResponse, 
  CorrectionRequest, 
  CorrectionResponse, 
  SelectAlternativeRequest, 
  SelectAlternativeResponse
} from '../types/meal';

// Enhanced upload with user description support
export async function uploadMeal(
  images: File[], 
  userDescription?: string
): Promise<MealUploadResponse> {
  const formData = new FormData();
  images.forEach(img => formData.append('images', img));
  if (userDescription) {
    formData.append('meal_name', userDescription);
  }
  
  return api<MealUploadResponse>('/meals/upload', {
    method: 'POST',
    body: formData
  });
}

// Submit correction for a meal
export async function submitCorrection(
  mealId: number, 
  correction: CorrectionRequest
): Promise<CorrectionResponse> {
  return api<CorrectionResponse>(`/meals/${mealId}/correction`, {
    method: 'POST',
    body: JSON.stringify(correction)
  });
}

// Select an alternative for a meal
export async function selectAlternative(
  mealId: number, 
  request: SelectAlternativeRequest
): Promise<SelectAlternativeResponse> {
  return api<SelectAlternativeResponse>(`/meals/${mealId}/select-alternative`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

// Mark meal as accurate (thumbs up)
export async function markMealAccurate(mealId: number): Promise<Meal> {
  return api<Meal>(`/meals/${mealId}/accurate`, {
    method: 'POST'
  });
}

