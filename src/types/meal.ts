// Enhanced Meal Analysis Types

export interface Alternative {
  name: string;
  confidence: number;
  reason: string;
}

export interface IdentifiedFood {
  food_name: string;
  quantity: string;
  calories: number;
}

export interface Macros {
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
}

// Enhanced Meal interface with new fields
export interface Meal {
  id: number;
  image_url: string;
  meal_name?: string;
  calories?: number;
  macros?: Macros;
  meal_rating?: number;
  suggestions?: string;
  confidence_score?: number;
  logged_at: string;
  user_id?: number;
  user_name?: string;
  likes_count?: number;
  liked_by_me?: boolean;
  comments?: CommentPublic[];
  comments_count?: number;
  isOwn?: boolean;
  
  // NEW FIELDS for enhanced analysis
  user_description?: string;
  description_relevance_score?: 'low' | 'medium' | 'high';
  alternatives?: Alternative[];
  selected_alternative?: Alternative | null;
  correction_count?: number;
  last_corrected_at?: string | null;
  identified_foods?: IdentifiedFood[];
}

// Correction types
export type CorrectionType = 
  | 'needs_correction'
  | 'choose_alternative'
  | 'portion_change'
  | 'calorie_change'
  | 'wrong_food_item';

export interface CorrectionRequest {
  correction_type: CorrectionType;
  user_feedback?: string;
  selected_alternative?: Alternative;
  portion_multiplier?: number;
  calories_delta_percent?: number;
  corrected_analysis?: Partial<Meal>;
}

export interface CorrectionResponse {
  success: boolean;
  meal: Meal;
  correction_logged: boolean;
  reanalyzed: boolean;
  envelope?: MealAnalysisEnvelope;
}

// Alternative selection request
export interface SelectAlternativeRequest {
  selected_alternative: Alternative;
}

export interface SelectAlternativeResponse {
  success: boolean;
  meal: Meal;
}

// Meal Analysis Envelope (unified response format)
export interface MealAnalysisEnvelope {
  meal_analysis: Meal;
  user_input: {
    description?: string;
    relevance_score?: 'low' | 'medium' | 'high';
  };
  correction_ui: {
    show_alternatives: boolean;
    show_text_correction: boolean;
    show_quick_edit: boolean;
  };
}

// Upload response with enhanced fields
export interface MealUploadResponse extends Meal {
  user_description?: string;
  description_relevance_score?: 'low' | 'medium' | 'high';
  alternatives?: Alternative[];
  selected_alternative?: Alternative | null;
  correction_count?: number;
  last_corrected_at?: string | null;
}

// Import existing comment type
export interface CommentPublic {
  id: number;
  meal_id: number;
  user_id: number;
  comment: string;
  created_at: string;
}

// UI state types
export interface MealDisplayState {
  showAlternatives: boolean;
  showCorrectionModal: boolean;
  showQuickEdit: boolean;
  isProcessing: boolean;
}

// Confidence level helpers
export const getConfidenceLevel = (score?: number): 'high' | 'medium' | 'low' => {
  if (!score) return 'low';
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
};

export const getConfidenceColor = (score?: number): string => {
  const level = getConfidenceLevel(score);
  switch (level) {
    case 'high': return '#22c55e'; // green
    case 'medium': return '#f59e0b'; // yellow
    case 'low': return '#ef4444'; // red
  }
};

export const shouldShowAlternatives = (meal: Meal): boolean => {
  return (meal.confidence_score ?? 0) < 0.7 || 
    (meal.alternatives?.some(alt => alt.confidence > 0.4) ?? false);
};

export const shouldShowTextCorrection = (meal: Meal): boolean => {
  return (meal.confidence_score ?? 0) < 0.6;
};

export const shouldShowQuickEdit = (meal: Meal): boolean => {
  return (meal.confidence_score ?? 0) < 0.8;
};

