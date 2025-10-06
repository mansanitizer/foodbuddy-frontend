import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorHandlerProps {
  error: string | null;
  onDismiss: () => void;
  autoHide?: boolean;
  duration?: number;
}

export default function ErrorHandler({
  error,
  onDismiss,
  autoHide = true,
  duration = 5000
}: ErrorHandlerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onDismiss, 300); // Wait for animation to complete
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoHide, duration, onDismiss]);

  const getErrorIcon = (error: string): string => {
    if (error.includes('network') || error.includes('connection')) return '📡';
    if (error.includes('upload') || error.includes('file')) return '📤';
    if (error.includes('correction') || error.includes('feedback')) return '✏️';
    if (error.includes('alternative') || error.includes('select')) return '🔄';
    if (error.includes('portion') || error.includes('calorie')) return '⚡';
    return '⚠️';
  };

  const getErrorColor = (error: string): string => {
    if (error.includes('network') || error.includes('connection')) return '#3b82f6'; // blue
    if (error.includes('upload') || error.includes('file')) return '#f59e0b'; // orange
    if (error.includes('correction') || error.includes('feedback')) return '#8b5cf6'; // purple
    if (error.includes('alternative') || error.includes('select')) return '#06b6d4'; // cyan
    if (error.includes('portion') || error.includes('calorie')) return '#10b981'; // emerald
    return '#ef4444'; // red (default)
  };

  return (
    <AnimatePresence>
      {isVisible && error && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            left: '20px',
            maxWidth: '400px',
            margin: '0 auto',
            zIndex: 1001,
            pointerEvents: 'auto'
          }}
        >
          <div
            style={{
              backgroundColor: getErrorColor(error),
              color: 'white',
              padding: '16px 20px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              position: 'relative'
            }}
          >
            <div style={{
              fontSize: '20px',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              {getErrorIcon(error)}
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '4px',
                lineHeight: '1.3'
              }}>
                {error.includes('network') || error.includes('connection') ? 'Connection Error' :
                 error.includes('upload') ? 'Upload Failed' :
                 error.includes('correction') ? 'Correction Failed' :
                 error.includes('alternative') ? 'Selection Failed' :
                 error.includes('portion') || error.includes('calorie') ? 'Update Failed' :
                 'Error'}
              </div>
              
              <div style={{
                fontSize: '13px',
                opacity: 0.9,
                lineHeight: '1.4',
                wordBreak: 'break-word'
              }}>
                {error}
              </div>
              
              {autoHide && (
                <div style={{
                  fontSize: '11px',
                  opacity: 0.7,
                  marginTop: '8px',
                  fontStyle: 'italic'
                }}>
                  This will disappear automatically
                </div>
              )}
            </div>
            
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onDismiss, 300);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px'
              }}
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing error state
export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const handleError = (errorMessage: string) => {
    console.error('Error:', errorMessage);
    setError(errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    handleError,
    clearError
  };
}

