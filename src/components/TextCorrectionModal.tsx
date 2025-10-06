import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitCorrection } from '../lib/api';
import type { Meal, CorrectionRequest } from '../types/meal';

interface TextCorrectionModalProps {
  meal: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (meal: Meal) => void;
  onError: (error: string) => void;
}

export default function TextCorrectionModal({
  meal,
  isOpen,
  onClose,
  onUpdate,
  onError
}: TextCorrectionModalProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCorrectionType, setSelectedCorrectionType] = useState<CorrectionRequest['correction_type']>('needs_correction');

  const correctionTypes = [
    {
      type: 'needs_correction' as const,
      label: 'Wrong identification',
      description: 'This is not the right food item',
      icon: '❌'
    },
    {
      type: 'wrong_food_item' as const,
      label: 'Different food',
      description: 'It\'s a completely different meal',
      icon: '🔄'
    }
  ] as const;

  const handleSubmit = async () => {
    if (!meal || !feedback.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const response = await submitCorrection(meal.id, {
        correction_type: selectedCorrectionType,
        user_feedback: feedback.trim()
      });
      
      if (response.success) {
        onUpdate(response.meal);
        onClose();
        setFeedback('');
      } else {
        onError('Failed to submit correction');
      }
    } catch (error: any) {
      console.error('Failed to submit correction:', error);
      onError(error.message || 'Failed to submit correction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFeedback('');
      setSelectedCorrectionType('needs_correction');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && meal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  color: 'var(--text-primary)',
                  fontSize: '20px',
                  fontWeight: '600'
                }}>
                  Help us improve this analysis
                </h3>
                <p style={{
                  margin: 0,
                  color: 'var(--text-secondary)',
                  fontSize: '14px'
                }}>
                  What's wrong with this meal identification?
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '24px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Meal Preview */}
            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '12px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <img
                src={meal.image_url}
                alt={meal.meal_name || 'Meal'}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '4px'
                }}>
                  {meal.meal_name || 'Meal'}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <span>🔥 {meal.calories || 0} kcal</span>
                  {meal.macros && (
                    <>
                      <span>⚡ {meal.macros.protein_g || 0}g</span>
                      <span>🌾 {meal.macros.carbs_g || 0}g</span>
                      <span>💧 {meal.macros.fat_g || 0}g</span>
                    </>
                  )}
                </div>
                {meal.confidence_score && (
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginTop: '4px'
                  }}>
                    Confidence: {Math.round(meal.confidence_score * 100)}%
                  </div>
                )}
              </div>
            </div>

            {/* Correction Type Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                Type of correction
              </label>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {correctionTypes.map((correction) => (
                  <motion.button
                    key={correction.type}
                    onClick={() => setSelectedCorrectionType(correction.type)}
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      backgroundColor: selectedCorrectionType === correction.type 
                        ? 'var(--accent-orange)' 
                        : 'var(--bg-tertiary)',
                      color: selectedCorrectionType === correction.type 
                        ? 'white' 
                        : 'var(--text-primary)',
                      border: `2px solid ${selectedCorrectionType === correction.type 
                        ? 'var(--accent-orange)' 
                        : 'var(--border-color)'}`,
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.6 : 1,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{correction.icon}</span>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '2px'
                      }}>
                        {correction.label}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        opacity: 0.8
                      }}>
                        {correction.description}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Feedback Textarea */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                Tell us more details
              </label>
              
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g., This is actually biryani, not curry. I had 2 servings."
                disabled={isSubmitting}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  resize: 'vertical',
                  minHeight: '100px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              />
              
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginTop: '4px',
                textAlign: 'right'
              }}>
                {feedback.length}/500 characters
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={!feedback.trim() || isSubmitting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--accent-orange)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: (!feedback.trim() || isSubmitting) ? 'not-allowed' : 'pointer',
                  opacity: (!feedback.trim() || isSubmitting) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%'
                    }}
                  />
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Correction'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

