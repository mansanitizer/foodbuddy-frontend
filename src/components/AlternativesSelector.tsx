import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { selectAlternative } from '../lib/api';
import type { Alternative, Meal } from '../types/meal';

interface AlternativesSelectorProps {
  alternatives: Alternative[];
  onSelect: (alternative: Alternative, updatedMeal: Meal) => void;
  onError: (error: string) => void;
  mealId: number;
  isVisible: boolean;
}

export default function AlternativesSelector({
  alternatives,
  onSelect,
  onError,
  mealId,
  isVisible
}: AlternativesSelectorProps) {
  const [selectedAlt, setSelectedAlt] = useState<Alternative | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelect = async (alternative: Alternative) => {
    if (isProcessing) return;
    
    setSelectedAlt(alternative);
    setIsProcessing(true);
    
    try {
      const response = await selectAlternative(mealId, {
        selected_alternative: alternative
      });
      
      if (response.success) {
        onSelect(alternative, response.meal);
      } else {
        onError('Failed to select alternative');
      }
    } catch (error: any) {
      console.error('Failed to select alternative:', error);
      onError(error.message || 'Failed to select alternative');
    } finally {
      setIsProcessing(false);
      setSelectedAlt(null);
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.7) return '#22c55e'; // green
    if (confidence >= 0.5) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getConfidenceText = (confidence: number): string => {
    if (confidence >= 0.7) return 'High match';
    if (confidence >= 0.5) return 'Medium match';
    return 'Low match';
  };

  return (
    <AnimatePresence>
      {isVisible && alternatives.length > 0 && (
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
            <span style={{ fontSize: '20px' }}>🤔</span>
            <h4 style={{
              margin: 0,
              color: 'var(--text-primary)',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Not quite right? Try these alternatives:
            </h4>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {alternatives.slice(0, 3).map((alt, index) => {
              const isSelected = selectedAlt?.name === alt.name;
              const confidenceColor = getConfidenceColor(alt.confidence);
              
              return (
                <motion.button
                  key={index}
                  onClick={() => handleSelect(alt)}
                  disabled={isProcessing}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: isSelected ? confidenceColor : 'var(--bg-secondary)',
                    border: `2px solid ${isSelected ? confidenceColor : 'var(--border-color)'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing && !isSelected ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: isSelected ? 'white' : 'var(--text-primary)',
                      flex: 1
                    }}>
                      {alt.name}
                    </div>
                    <div style={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : confidenceColor,
                      color: isSelected ? 'white' : 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      marginLeft: '12px'
                    }}>
                      {Math.round(alt.confidence * 100)}%
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '13px',
                    color: isSelected ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)',
                    lineHeight: '1.4',
                    marginBottom: '4px'
                  }}>
                    {alt.reason}
                  </div>
                  
                  <div style={{
                    fontSize: '11px',
                    color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)',
                    fontStyle: 'italic'
                  }}>
                    {getConfidenceText(alt.confidence)}
                  </div>
                </motion.button>
              );
            })}
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
                Updating meal...
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

