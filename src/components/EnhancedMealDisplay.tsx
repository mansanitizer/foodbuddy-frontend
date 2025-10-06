import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AlternativesSelector from './AlternativesSelector';
import QuickEditControls from './QuickEditControls';
import TextCorrectionModal from './TextCorrectionModal';
import { markMealAccurate } from '../lib/api';
import type { 
  Meal, 
  Alternative, 
  MealDisplayState
} from '../types/meal';

interface EnhancedMealDisplayProps {
  meal: Meal;
  onUpdate: (meal: Meal) => void;
  onError: (error: string) => void;
  isOwn?: boolean;
}

export default function EnhancedMealDisplay({
  meal,
  onUpdate,
  onError,
  isOwn = false
}: EnhancedMealDisplayProps) {
  const [state, setState] = useState<MealDisplayState>({
    showAlternatives: false,
    showCorrectionModal: false,
    showQuickEdit: false,
    isProcessing: false
  });

  // Import helper functions from types
  const getConfidenceLevel = (score?: number): 'high' | 'medium' | 'low' => {
    if (!score) return 'low';
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  };

  const getConfidenceColor = (score?: number): string => {
    const level = getConfidenceLevel(score);
    switch (level) {
      case 'high': return '#22c55e'; // green
      case 'medium': return '#f59e0b'; // yellow
      case 'low': return '#ef4444'; // red
    }
  };

  const shouldShowAlternatives = (meal: Meal): boolean => {
    return (meal.confidence_score ?? 0) < 0.7 || 
      (meal.alternatives?.some(alt => alt.confidence > 0.4) ?? false);
  };

  const shouldShowTextCorrection = (meal: Meal): boolean => {
    return (meal.confidence_score ?? 0) < 0.6;
  };

  const shouldShowQuickEdit = (meal: Meal): boolean => {
    return (meal.confidence_score ?? 0) < 0.8;
  };

  // Initialize UI state based on meal data
  useEffect(() => {
    setState(prev => ({
      ...prev,
      showAlternatives: shouldShowAlternatives(meal),
      showQuickEdit: shouldShowQuickEdit(meal)
    }));
  }, [meal]);

  const handleAlternativeSelect = async (_alternative: Alternative, updatedMeal: Meal) => {
    onUpdate(updatedMeal);
    setState(prev => ({ ...prev, showAlternatives: false }));
  };

  const handleMarkAccurate = async () => {
    if (state.isProcessing) return;
    
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const updatedMeal = await markMealAccurate(meal.id);
      onUpdate(updatedMeal);
      
      // Hide correction options after marking as accurate
      setState(prev => ({
        ...prev,
        showAlternatives: false,
        showQuickEdit: false,
        isProcessing: false
      }));
    } catch (error: any) {
      console.error('Failed to mark meal as accurate:', error);
      onError(error.message || 'Failed to mark meal as accurate');
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleOpenCorrectionModal = () => {
    setState(prev => ({ ...prev, showCorrectionModal: true }));
  };

  const handleCloseCorrectionModal = () => {
    setState(prev => ({ ...prev, showCorrectionModal: false }));
  };

  const handleCorrectionUpdate = (updatedMeal: Meal) => {
    onUpdate(updatedMeal);
    setState(prev => ({ ...prev, showCorrectionModal: false }));
  };

  const confidenceColor = getConfidenceColor(meal.confidence_score);

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '16px',
      padding: '16px',
      border: '1px solid var(--border-color)',
      position: 'relative'
    }}>
      {/* Header with meal name and confidence */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <h3 style={{
          margin: 0,
          color: 'var(--text-primary)',
          fontSize: '18px',
          fontWeight: '600',
          flex: 1,
          lineHeight: '1.3'
        }}>
          {meal.meal_name || 'Meal'}
        </h3>
        
        {meal.confidence_score && (
          <div style={{
            backgroundColor: confidenceColor,
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            marginLeft: '12px',
            whiteSpace: 'nowrap'
          }}>
            {Math.round(meal.confidence_score * 100)}%
          </div>
        )}
      </div>

      {/* Meal details */}
      <div style={{
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '12px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginBottom: '8px'
        }}>
          <span>🔥 {meal.calories || 0} kcal</span>
          {meal.macros && (
            <>
              <span>⚡ {meal.macros.protein_g || 0}g</span>
              <span>🌾 {meal.macros.carbs_g || 0}g</span>
              <span>💧 {meal.macros.fat_g || 0}g</span>
              {typeof meal.macros.fiber_g === 'number' && (
                <span>🧵 {meal.macros.fiber_g}g</span>
              )}
            </>
          )}
        </div>

        {typeof meal.meal_rating === 'number' && (
          <div style={{
            fontSize: '14px',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>
              {meal.meal_rating >= 7 ? '🟩' : meal.meal_rating >= 4 ? '🟨' : '🟥'}
            </span>
            <span>Rating: {meal.meal_rating}/10</span>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {meal.suggestions && (
        <div style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '12px'
        }}>
          <h5 style={{
            margin: '0 0 8px 0',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            💡 Suggestions
          </h5>
          <p style={{
            margin: 0,
            color: 'var(--text-secondary)',
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            {meal.suggestions}
          </p>
        </div>
      )}

      {/* User description and relevance */}
      {meal.user_description && (
        <div style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}>
            <span style={{ fontSize: '16px' }}>💬</span>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Your description
            </span>
            {meal.description_relevance_score && (
              <span style={{
                backgroundColor: meal.description_relevance_score === 'high' ? '#22c55e' : 
                                meal.description_relevance_score === 'medium' ? '#f59e0b' : '#ef4444',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                {meal.description_relevance_score}
              </span>
            )}
          </div>
          <p style={{
            margin: 0,
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontStyle: 'italic'
          }}>
            "{meal.user_description}"
          </p>
        </div>
      )}

      {/* Alternatives Selector */}
      {isOwn && (
        <AlternativesSelector
          alternatives={meal.alternatives || []}
          onSelect={handleAlternativeSelect}
          onError={onError}
          mealId={meal.id}
          isVisible={state.showAlternatives}
        />
      )}

      {/* Quick Edit Controls */}
      {isOwn && (
        <QuickEditControls
          meal={meal}
          onUpdate={onUpdate}
          onError={onError}
          isVisible={state.showQuickEdit}
        />
      )}

      {/* Correction Actions */}
      {isOwn && (
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <motion.button
            onClick={handleMarkAccurate}
            disabled={state.isProcessing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: state.isProcessing ? 'not-allowed' : 'pointer',
              opacity: state.isProcessing ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>👍</span>
            Accurate
          </motion.button>
          
          {shouldShowTextCorrection(meal) && (
            <motion.button
              onClick={handleOpenCorrectionModal}
              disabled={state.isProcessing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: state.isProcessing ? 'not-allowed' : 'pointer',
                opacity: state.isProcessing ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>👎</span>
              Needs Correction
            </motion.button>
          )}
        </div>
      )}

      {/* Processing indicator */}
      {state.isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid var(--border-color)',
                borderTop: '3px solid var(--accent-orange)',
                borderRadius: '50%'
              }}
            />
            <span style={{
              color: 'white',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Processing...
            </span>
          </div>
        </motion.div>
      )}

      {/* Text Correction Modal */}
      <TextCorrectionModal
        meal={meal}
        isOpen={state.showCorrectionModal}
        onClose={handleCloseCorrectionModal}
        onUpdate={handleCorrectionUpdate}
        onError={onError}
      />
    </div>
  );
}

