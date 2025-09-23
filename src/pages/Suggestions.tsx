// pages/Suggestions.tsx
import { useSuggestions } from '../hooks/useSuggestions';
import { SuggestionsCard } from '../components/SuggestionsCard';
import '../styles/suggestions.css';

export default function Suggestions() {
  const { suggestions, loading, error, refreshSuggestions } = useSuggestions();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      paddingBottom: '80px'
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            fwb
          </div>
        </div>
        <h2 style={{
          margin: 0,
          color: 'var(--text-primary)',
          fontSize: '20px',
          fontWeight: '600'
        }}>
          Meal Suggestions
        </h2>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <SuggestionsCard
          suggestions={suggestions?.suggestions || []}
          restaurants={suggestions?.restaurants || []}
          loading={loading}
          error={error}
          onRefresh={refreshSuggestions}
        />

        {suggestions?.notes && (
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px',
            borderLeft: '4px solid var(--accent-orange)'
          }}>
            <h4 style={{
              margin: '0 0 8px 0',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}>
              💡 Notes
            </h4>
            <p style={{
              margin: 0,
              color: 'var(--text-secondary)',
              fontSize: '13px',
              lineHeight: '1.5'
            }}>
              {suggestions.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
