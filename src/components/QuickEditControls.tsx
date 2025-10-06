import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitCorrection } from '../lib/api';
import type { Meal, CorrectionRequest } from '../types/meal';

interface QuickEditControlsProps {
  meal: Meal;
  onUpdate: (meal: Meal) => void;
  onError: (error: string) => void;
  isVisible: boolean;
}

export default function QuickEditControls({
  meal,
  onUpdate,
  onError,
  isVisible
}: QuickEditControlsProps) {
  const [portionMultiplier, setPortionMultiplier] = useState(1.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<string | null>(null);

  const handleCorrection = useCallback(async (
    correctionType: CorrectionRequest['correction_type'],
    data: Partial<CorrectionRequest> = {}
  ) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setProcessingType(correctionType);
    
    try {
      const response = await submitCorrection(meal.id, {
        correction_type: correctionType,
        ...data
      });
      
      if (response.success) {
        onUpdate(response.meal);
      } else {
        onError('Failed to update meal');
      }
    } catch (error: any) {
      console.error(`Failed to ${correctionType}:`, error);
      onError(error.message || `Failed to ${correctionType}`);
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  }, [meal.id, onUpdate, onError, isProcessing]);

  const handlePortionChange = useCallback((multiplier: number) => {
    setPortionMultiplier(multiplier);
    handleCorrection('portion_change', {
      portion_multiplier: multiplier
    });
  }, [handleCorrection]);

  const handleCalorieAdjustment = useCallback((delta: number) => {
    handleCorrection('calorie_change', {
      calories_delta_percent: delta
    });
  }, [handleCorrection]);

  const originalCalories = meal.calories || 0;
  const adjustedCalories = Math.round(originalCalories * portionMultiplier);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '12px',
            padding: '16px',
            margin: '12px 0',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <h4 style={{
              margin: 0,
              color: 'var(--text-primary)',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Quick Edit
            </h4>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Portion Size Control */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)'
                }}>
                  Portion Size
                </label>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--accent-orange)',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}>
                  {portionMultiplier}x
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}>
                  0.5x
                </span>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={portionMultiplier}
                  onChange={(e) => handlePortionChange(parseFloat(e.target.value))}
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: '3px',
                    background: 'var(--bg-secondary)',
                    outline: 'none',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.6 : 1
                  }}
                />
                <span style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}>
                  3.0x
                </span>
              </div>
              
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                Calories: {originalCalories} → {adjustedCalories}
              </div>
            </div>

            {/* Calorie Adjustment Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)'
              }}>
                Calorie Adjustment
              </label>
              
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center'
              }}>
                {[-20, -10, 10, 20].map((delta) => (
                  <motion.button
                    key={delta}
                    onClick={() => handleCalorieAdjustment(delta)}
                    disabled={isProcessing}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      backgroundColor: delta < 0 ? '#ef4444' : '#22c55e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      opacity: isProcessing ? 0.6 : 1,
                      minWidth: '50px'
                    }}
                  >
                    {delta > 0 ? '+' : ''}{delta}%
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '16px',
                padding: '12px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px'
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid var(--border-color)',
                  borderTop: '2px solid var(--accent-orange)',
                  borderRadius: '50%'
                }}
              />
              <span style={{
                color: 'var(--text-secondary)',
                fontSize: '14px'
              }}>
                {processingType === 'portion_change' ? 'Updating portion...' : 
                 processingType === 'calorie_change' ? 'Adjusting calories...' : 
                 'Updating meal...'}
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

