// components/SuggestionsCard.tsx
import React from 'react';
import type { SuggestionItem, RestaurantSuggestion } from '../lib/suggestions';

interface SuggestionsCardProps {
  suggestions: SuggestionItem[];
  restaurants: RestaurantSuggestion[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const SuggestionsCard: React.FC<SuggestionsCardProps> = ({
  suggestions,
  restaurants,
  loading,
  error,
  onRefresh
}) => {
  if (loading) {
    return (
      <div className="suggestions-card loading">
        <div className="loading-spinner" />
        <p>Generating personalized meal suggestions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="suggestions-card error">
        <h3>Unable to load suggestions</h3>
        <p>{error}</p>
        <button onClick={onRefresh} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="suggestions-card">
      <div className="suggestions-header">
        <h3>Today's Meal Suggestions</h3>
        <button onClick={onRefresh} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <SuggestionItem key={index} suggestion={suggestion} />
        ))}
      </div>

      {restaurants.length > 0 && (
        <div className="restaurant-suggestions">
          <h4>Restaurant Options</h4>
          {restaurants.map((restaurant, index) => (
            <RestaurantItem key={index} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};

const SuggestionItem: React.FC<{ suggestion: SuggestionItem }> = ({ suggestion }) => (
  <div className="suggestion-item">
    <div className="suggestion-header">
      <h4>{suggestion.title}</h4>
      {suggestion.meal_timing_hint && (
        <span className="timing-hint">{suggestion.meal_timing_hint}</span>
      )}
    </div>

    <p className="suggestion-description">{suggestion.description}</p>

    <div className="suggestion-macros">
      {suggestion.estimated_calories && (
        <span className="calories">{suggestion.estimated_calories} cal</span>
      )}

      {suggestion.estimated_macros && (
        <div className="macros">
          {suggestion.estimated_macros.protein_g && (
            <span>P: {suggestion.estimated_macros.protein_g}g</span>
          )}
          {suggestion.estimated_macros.carbs_g && (
            <span>C: {suggestion.estimated_macros.carbs_g}g</span>
          )}
          {suggestion.estimated_macros.fat_g && (
            <span>F: {suggestion.estimated_macros.fat_g}g</span>
          )}
        </div>
      )}
    </div>
  </div>
);

const RestaurantItem: React.FC<{ restaurant: RestaurantSuggestion }> = ({ restaurant }) => (
  <div className="restaurant-item">
    <div className="restaurant-header">
      <h5>{restaurant.name}</h5>
      <span className="area-badge">{restaurant.area}</span>
    </div>
    <p className="suggested-dish">{restaurant.suggested_dish}</p>
    <p className="fit-reason">{restaurant.fit_reason}</p>
  </div>
);
