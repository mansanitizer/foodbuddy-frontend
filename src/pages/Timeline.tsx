import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'

type Meal = {
  id: number
  image_url: string
  meal_name?: string
  calories?: number
  macros?: {
    protein_g?: number
    carbs_g?: number
    fat_g?: number
    fiber_g?: number
  }
  meal_rating?: number
  suggestions?: string
  confidence_score?: number
  logged_at: string
}

type MealUploadModalProps = {
  isOpen: boolean
  onClose: () => void
  onUpload: (mealName: string, files: FileList) => Promise<void>
}

type MealDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  meal: Meal | null
}

interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
}

// Parse backend timestamps robustly:
// - If timezone info is present (Z or +hh:mm / -hh:mm), use as-is
// - Otherwise, assume the timestamp is UTC and append 'Z'
function parseMealDate(timestamp: string): Date {
  const hasTimezone = /[zZ]|[+\-]\d{2}:?\d{2}$/.test(timestamp)
  return new Date(hasTimezone ? timestamp : `${timestamp}Z`)
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function MealUploadModal({ isOpen, onClose, onUpload }: MealUploadModalProps) {
  const [mealName, setMealName] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async () => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    try {
      await onUpload(mealName, files)
    } finally {
      setIsUploading(false)
      onClose()
      setMealName('')
      setFiles(null)
    }
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
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
            zIndex: 1000
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '20px',
              width: '90%',
              maxWidth: '400px',
              margin: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
            marginBottom: '12px'
        }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Add Meal</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={e => setFiles(e.target.files)}
          style={{
            display: 'block',
            width: '100%',
              marginBottom: '12px',
              padding: '10px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)'
          }}
        />

        <input
          placeholder="Meal name (optional)"
          value={mealName}
          onChange={e => setMealName(e.target.value)}
          style={{
            display: 'block',
            width: '100%',
              marginBottom: '12px',
              padding: '10px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)'
          }}
        />

        <button
          onClick={handleUpload}
          disabled={isUploading || !files?.length}
          style={{
            width: '100%',
              padding: '10px',
            backgroundColor: 'var(--accent-orange)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isUploading || !files?.length ? 'not-allowed' : 'pointer',
            opacity: isUploading || !files?.length ? 0.6 : 1
          }}
        >
          {isUploading ? 'Uploading...' : 'Upload Meal'}
        </button>
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Uploading…</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <motion.span
                  animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}
                />
                <motion.span
                  animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}
                />
                <motion.span
                  animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MealDetailModal({ isOpen, onClose, meal }: MealDetailModalProps) {
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
            zIndex: 1000
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '20px',
              width: '90%',
              maxWidth: '500px',
              margin: '20px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Meal Details</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <img
            src={meal.image_url}
            style={{
              width: '100%',
              height: '180px',
              objectFit: 'cover',
              borderRadius: '12px',
              marginBottom: '12px'
            }}
          />

          <h4 style={{
            margin: '0 0 8px 0',
            color: 'var(--text-primary)',
            fontSize: '18px'
          }}>
            {meal.meal_name || 'Meal'}
          </h4>

          <p style={{
            margin: '0 0 16px 0',
            color: 'var(--text-secondary)',
            fontSize: '13px'
          }}>
            Logged at: {new Date(meal.logged_at).toLocaleString()}
          </p>
        </div>

        {/* Nutritional Information */}
        <div style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '12px'
        }}>
          <h5 style={{
            margin: '0 0 12px 0',
            color: 'var(--text-primary)',
            fontSize: '14px'
          }}>
            Nutritional Information
          </h5>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Calories:</span>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {meal.calories || 0} kcal
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Confidence:</span>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {meal.confidence_score ? Math.round(meal.confidence_score * 100) : 0}%
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Rating:</span>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {meal.meal_rating ? `${meal.meal_rating}/10` : 'N/A'}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Protein:</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {meal.macros?.protein_g || 0}g
              </div>
            </div>
          </div>
        </div>

        {/* Macronutrients */}
        {meal.macros && (
          <div style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <h5 style={{
              margin: '0 0 12px 0',
              color: 'var(--text-primary)',
              fontSize: '16px'
            }}>
              Macronutrients
            </h5>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Protein:</span>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {meal.macros.protein_g || 0}g
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Carbs:</span>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {meal.macros.carbs_g || 0}g
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Fat:</span>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {meal.macros.fat_g || 0}g
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Fiber:</span>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {meal.macros.fiber_g || 0}g
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {meal.suggestions && (
          <div style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '12px',
            padding: '12px'
          }}>
            <h5 style={{
              margin: '0 0 12px 0',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}>
              Suggestions
            </h5>
            <p style={{
              margin: 0,
              color: 'var(--text-secondary)',
              fontStyle: 'italic'
            }}>
              {meal.suggestions}
            </p>
          </div>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

type MacroProgressProps = {
  label: string
  value: number  // remaining amount
  target: number // target amount
  unit: string
  color: string
  isOver?: boolean
  mode?: 'left' | 'in'
  onToggle?: () => void
}

function MacroProgress({ label, value, target, unit, color, isOver, mode = 'left', onToggle }: MacroProgressProps) {
  // Calculate percentage: (remaining / target) * 100, but cap at 100%
  const percentage = Math.min(Math.max((value / target) * 100, 0), 100)

  return (
    <div onClick={onToggle} style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '16px',
      padding: '10px',
      textAlign: 'center',
      position: 'relative',
      flex: 1,
      margin: '0 4px',
      cursor: 'pointer'
    }}>
      <div style={{
        fontSize: '18px',
        fontWeight: 'bold',
        color: isOver ? '#ef4444' : 'var(--text-primary)',
        marginBottom: '2px'
      }}>
        {value}{unit}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
        {label} {mode === 'left' ? 'left' : 'in'}
      </div>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: 'var(--bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        position: 'relative'
      }}>
        <svg width="44" height="44" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="22"
            cy="22"
            r="18"
            stroke="var(--border-color)"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="22"
            cy="22"
            r="18"
            stroke={color}
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 18}`}
            strokeDashoffset={`${2 * Math.PI * 18 * (1 - percentage / 100)}`}
            strokeLinecap="round"
          />
        </svg>
        <div style={{
          position: 'absolute',
          fontSize: '10px',
          fontWeight: 'bold',
          color: 'var(--text-primary)'
        }}>
          {Math.round(percentage)}%
        </div>
      </div>
    </div>
  )
}

function CircularProgress({ percentage, size = 80, strokeWidth = 8, color = 'var(--accent-orange)' }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-color)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '18px',
        fontWeight: 'bold',
        color: 'var(--text-primary)'
      }}>
        {Math.round(percentage)}%
      </div>
    </div>
  )
}

export default function Timeline() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [buddyMeals, setBuddyMeals] = useState<Meal[]>([])
  const [error, setError] = useState<string | null>(null)
  const [tdee, setTdee] = useState<number | null>(null)
  const [target, setTarget] = useState<number | null>(null)
  const [hasBuddy, setHasBuddy] = useState(false)
  const [activeTab, setActiveTab] = useState<'today' | 'yesterday'>('today')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [calorieMode, setCalorieMode] = useState<'left' | 'in'>('left')
  const [macroMode, setMacroMode] = useState<'left' | 'in'>('left')

  // Calculate today's and yesterday's meals
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Combine own meals and buddy meals into unified timeline
  const allMeals = [
    ...meals.map(meal => ({ ...meal, isOwn: true })),
    ...buddyMeals.map(meal => ({ ...meal, isOwn: false }))
  ]

  // Sort all meals chronologically (newest first)
  const sortedAllMeals = allMeals.sort((a, b) =>
    new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  )

  const displayedMeals = activeTab === 'today'
    ? sortedAllMeals.filter(m => {
        const mealDate = parseMealDate(m.logged_at)
        return isSameLocalDay(mealDate, today)
      })
    : sortedAllMeals.filter(m => {
        const mealDate = parseMealDate(m.logged_at)
        return isSameLocalDay(mealDate, yesterday)
      })

  // Calculate calories consumed today (OWN meals only)
  const todayMineMeals = meals.filter(m => {
    const mealDate = parseMealDate(m.logged_at)
    return isSameLocalDay(mealDate, today)
  })

  const todayCaloriesIn = todayMineMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0)
  const caloriesLeft = target ? Math.max(0, target - todayCaloriesIn) : (tdee || 2500)
  const caloriesPercentage = target ? Math.min(100, (todayCaloriesIn / target) * 100) : 0

  // Calculate macros consumed today (OWN meals only)
  const todayMacrosIn = todayMineMeals.reduce((acc, meal) => ({
    protein: acc.protein + (meal.macros?.protein_g || 0),
    carbs: acc.carbs + (meal.macros?.carbs_g || 0),
    fat: acc.fat + (meal.macros?.fat_g || 0)
  }), { protein: 0, carbs: 0, fat: 0 })

  // Calculate target macros based on daily calorie target and macro percentages
  // Note: Backend stores macro percentages (30% protein, 40% carbs, 30% fat)
  // but frontend currently uses hardcoded values for display
  const targetCalories = target || tdee || 2500

  // Macro targets in grams (calculated from calorie target)
  // 4 calories per gram of protein, 4 calories per gram of carbs, 9 calories per gram of fat
  const targetMacros = {
    protein: Math.round((targetCalories * 0.30) / 4), // 30% of calories from protein
    carbs: Math.round((targetCalories * 0.40) / 4),   // 40% of calories from carbs
    fat: Math.round((targetCalories * 0.30) / 9)      // 30% of calories from fat
  }

  useEffect(() => {
    api<Meal[]>('/meals/mine').then(setMeals).catch(e => setError(String(e)))
    api<Meal[]>('/meals/buddy').then(setBuddyMeals).catch(() => {})
    api<{ id:number; email:string; name?:string; buddy_id?:number; tdee?:number; daily_calorie_target?:number }>('/users/me')
      .then(u => { 
        setTdee(u.tdee ?? null); 
        setTarget(u.daily_calorie_target ?? null);
        setHasBuddy(!!u.buddy_id);
      })
      .catch(() => {})
  }, [])


  async function deleteMeal(mealId: number) {
    if (!confirm('Delete this meal?')) return
    try {
      await api(`/meals/${mealId}`, { method: 'DELETE' })
      setMeals(meals => meals.filter(m => m.id !== mealId))
    } catch (e: any) {
      setError(e.message || 'Delete failed')
    }
  }

  async function handleMealUpload(mealName: string, files: FileList) {
    setError(null)
    try {
      const form = new FormData()
      for (let i = 0; i < files.length; i++) form.append('images', files[i])
      if (mealName) form.append('meal_name', mealName)
      const created = await api<Meal>('/meals/upload', { method: 'POST', body: form })
      setMeals(m => [created, ...m])
      setShowUploadModal(false)
    } catch (e: any) {
      setError(e.message || 'Upload failed')
    }
  }

  function handlePairClick() {
    window.location.assign('/pair')
  }

  // Settings navigation handled by global BottomNav

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '20px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            📷
          </button>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={handlePairClick}
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '20px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              😊
            </button>
            {hasBuddy && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                border: '2px solid var(--bg-secondary)'
              }} />
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        padding: '0 20px',
        marginTop: '20px'
      }}>
        <button
          onClick={() => setActiveTab('today')}
          style={{
            backgroundColor: activeTab === 'today' ? 'var(--accent-orange)' : 'transparent',
            color: activeTab === 'today' ? 'white' : 'var(--text-secondary)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '16px',
            fontWeight: '500',
            marginRight: '8px'
          }}
        >
          Today
        </button>
        <button
          onClick={() => setActiveTab('yesterday')}
          style={{
            backgroundColor: activeTab === 'yesterday' ? 'var(--accent-orange)' : 'transparent',
            color: activeTab === 'yesterday' ? 'white' : 'var(--text-secondary)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Yesterday
        </button>
      </div>

      {/* Calories Section - tap to toggle */}
      <div onClick={() => setCalorieMode(m => m === 'left' ? 'in' : 'left')} style={{
        backgroundColor: 'var(--bg-secondary)',
        margin: '12px 20px 12px 20px',
        borderRadius: '16px',
        padding: '12px 16px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: 'var(--text-primary)',
          marginBottom: '4px'
        }}>
          {calorieMode === 'left' ? caloriesLeft : todayCaloriesIn}
        </div>
        <div style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '10px'
        }}>
          Calories {calorieMode === 'left' ? 'left' : 'in'}
        </div>
        <CircularProgress
          percentage={caloriesPercentage}
          size={80}
          color="var(--accent-orange)"
        />
      </div>

      {/* Macronutrients - tap any to toggle */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '0 20px',
        marginBottom: '12px'
      }}>
        <MacroProgress
          label="Protein"
          value={macroMode === 'left' ? Math.max(0, targetMacros.protein - todayMacrosIn.protein) : todayMacrosIn.protein}
          target={targetMacros.protein}
          unit="g"
          color="#ef4444"
          isOver={todayMacrosIn.protein > targetMacros.protein}
          mode={macroMode}
          onToggle={() => setMacroMode(m => m === 'left' ? 'in' : 'left')}
        />
        <MacroProgress
          label="Carbs"
          value={macroMode === 'left' ? Math.max(0, targetMacros.carbs - todayMacrosIn.carbs) : todayMacrosIn.carbs}
          target={targetMacros.carbs}
          unit="g"
          color="#f59e0b"
          isOver={todayMacrosIn.carbs > targetMacros.carbs}
          mode={macroMode}
          onToggle={() => setMacroMode(m => m === 'left' ? 'in' : 'left')}
        />
        <MacroProgress
          label="Fats"
          value={macroMode === 'left' ? Math.max(0, targetMacros.fat - todayMacrosIn.fat) : todayMacrosIn.fat}
          target={targetMacros.fat}
          unit="g"
          color="#3b82f6"
          isOver={todayMacrosIn.fat > targetMacros.fat}
          mode={macroMode}
          onToggle={() => setMacroMode(m => m === 'left' ? 'in' : 'left')}
        />
      </div>

      {/* Unified Timeline Display */}
      <div style={{ padding: '0 20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            {activeTab === 'today' ? 'Today' : 'Yesterday'}
          </h3>
          {hasBuddy && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-orange)',
                border: '2px solid var(--bg-secondary)'
              }}></div>
              <span>Your meals</span>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-blue)',
                border: '2px solid var(--bg-secondary)'
              }}></div>
              <span>Buddy meals</span>
            </div>
          )}
        </div>

        {displayedMeals.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            padding: '40px 0'
          }}>
            No meals logged {activeTab === 'today' ? 'today' : 'yesterday'}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {displayedMeals.map((m, idx) => (
            <motion.div
              key={`${(m as any).isOwn ? 'mine' : 'buddy'}-${m.id}-${m.logged_at}`}
              onClick={() => setSelectedMeal(m)}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.2) }}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '16px',
                padding: '12px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, transform 0.15s ease',
                borderLeft: `4px solid ${m.isOwn ? 'var(--accent-orange)' : 'var(--accent-blue)'}`,
                position: 'relative'
              }}
              whileHover={{ scale: 1.01 }}
            >
              {/* Ownership indicator */}
              <div style={{
                position: 'absolute',
                top: '-4px',
                left: '-4px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: m.isOwn ? 'var(--accent-orange)' : 'var(--accent-blue)',
                border: '3px solid var(--bg-primary)',
                zIndex: 1
              }}></div>

              <img
                src={m.image_url}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  objectFit: 'cover'
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {m.meal_name || 'Meal'}
                  {m.isOwn ? (
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--accent-orange)',
                      fontWeight: '600'
                    }}>
                      (You)
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--accent-blue)',
                      fontWeight: '600'
                    }}>
                      (Buddy)
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px'
                }}>
                  {parseMealDate(m.logged_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🔥 {m.calories || 0} kcal
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⚡ {m.macros?.protein_g || 0}g
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🌾 {m.macros?.carbs_g || 0}g
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    💧 {m.macros?.fat_g || 0}g
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                {m.isOwn && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteMeal(m.id)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '16px',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    🗑️
                  </button>
                )}
                <div style={{
                  color: 'var(--text-muted)',
                  fontSize: '12px'
                }}>
                  Tap to view
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        )}
      </div>

      {/* Bottom Navigation moved to global App */}

      {/* Modals */}
      <MealUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleMealUpload}
      />

      <MealDetailModal
        isOpen={selectedMeal !== null}
        onClose={() => setSelectedMeal(null)}
        meal={selectedMeal}
      />

      {/* Analytics modal removed in favor of navigating to /profile */}

      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
    </div>
  )
}

