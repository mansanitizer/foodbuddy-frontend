// suggestions.ts - API service layer for meal suggestions
import { api } from './api'

export interface SuggestionItem {
  title: string;
  description: string;
  estimated_calories: number | null;
  estimated_macros: {
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
    fiber_g: number | null;
  } | null;
  meal_timing_hint: string | null;
}

export interface RestaurantSuggestion {
  name: string;
  area: "Indiranagar" | "Koramangala";
  suggested_dish: string;
  fit_reason: string;
}

export interface SuggestionsResponse {
  num_suggestions: number;
  suggestions: SuggestionItem[];
  restaurants: RestaurantSuggestion[];
  notes: string | null;
}

export const suggestionsApi = {
  async getSuggestions(forceRefresh: boolean = false): Promise<SuggestionsResponse> {
    const path = forceRefresh
      ? '/recommendations/suggestions?force_refresh=true'
      : '/recommendations/suggestions';
    return api<SuggestionsResponse>(path);
  }
};
