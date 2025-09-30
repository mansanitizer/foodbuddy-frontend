import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, likeMeal, unlikeMeal, postComment, getBuddyStatus } from '../lib/api'
import type { CommentPublic as CommentPublicType, BuddyStatusResponse } from '../lib/api'

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
  user_id?: number
  user_name?: string
  likes_count?: number
  liked_by_me?: boolean
  comments?: CommentPublicType[]
  comments_count?: number
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
  onToggleLike: (mealId: number) => void
  commentText: string
  onCommentTextChange: (text: string) => void
  onCommentSubmit: (mealId: number) => void
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

function MealDetailModal({
  isOpen,
  onClose,
  meal,
  onToggleLike,
  commentText,
  onCommentTextChange,
  onCommentSubmit
}: MealDetailModalProps) {
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

        {/* Like and Comment Section */}
        <div style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '12px',
          padding: '16px',
          marginTop: '16px'
        }}>
          <h5 style={{
            margin: '0 0 16px 0',
            color: 'var(--text-primary)',
            fontSize: '16px'
          }}>
            Interaction
          </h5>

          {/* Like Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                onClick={() => onToggleLike(meal.id)}
                title={meal.liked_by_me ? 'Unlike this meal' : 'Like this meal'}
              >
                {meal.liked_by_me ? '❤️' : '🤍'}
              </button>
              <span style={{
                color: 'var(--text-secondary)',
                fontSize: '14px'
              }}>
                {meal.likes_count ?? 0} likes
              </span>
            </div>
          </div>

          {/* Comments Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Comment Input */}
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => onCommentTextChange(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onCommentSubmit(meal.id)
                  }
                }}
              />
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--accent-orange)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onClick={() => onCommentSubmit(meal.id)}
                disabled={!commentText.trim()}
              >
                Post
              </button>
            </div>

            {/* Comments List */}
            {(meal.comments || []).length > 0 && (
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {(meal.comments || []).map((comment: CommentPublicType) => (
                  <div key={comment.id} style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      marginBottom: '4px'
                    }}>
                      {comment.comment}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)'
                    }}>
                      {new Date(comment.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
  const [buddyStatus, setBuddyStatus] = useState<BuddyStatusResponse | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'today' | 'yesterday'>('today')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [calorieMode, setCalorieMode] = useState<'left' | 'in'>('left')
  const [macroMode, setMacroMode] = useState<'left' | 'in'>('left')
  // Like and comment state
  const [commentText, setCommentText] = useState('')
  // Profile completeness state
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false)

  // Calculate today's and yesterday's meals
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Combine all meals into unified timeline
  const allMeals = [...meals, ...buddyMeals]

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
  const todayMineMeals = allMeals.filter(m => {
    const mealDate = parseMealDate(m.logged_at)
    return isSameLocalDay(mealDate, today) && m.user_id === currentUserId
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
    api<{ id:number; email:string; name?:string; age?:number; gender?:string; tdee?:number; daily_calorie_target?:number; dietary_preferences?: string[]; fitness_goals?: string[]; activity_level?: string }>('/users/me')
      .then(u => {
        setCurrentUserId(u.id);
        setTdee(u.tdee ?? null);
        setTarget(u.daily_calorie_target ?? null);
        
        // Check if profile is complete (has essential fields beyond just email)
        const isComplete = !!(u.name && u.age && u.gender);
        setIsProfileIncomplete(!isComplete);
      })
      .catch(() => {})
    
    // Fetch buddy status using new API
    getBuddyStatus()
      .then(setBuddyStatus)
      .catch(() => {})
  }, [])

  // Backend now returns likes/comments with meals; avoid extra per-meal fetches.

  // Helper function to get display name for a meal
  function getMealDisplayName(meal: Meal): string {
    if (meal.user_id === currentUserId) {
      return 'You'
    }
    return meal.user_name || 'Buddy'
  }

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

  // Like and comment functions
  async function toggleLike(mealId: number) {
    try {
      setError(null)
      const source = selectedMeal?.id === mealId
        ? selectedMeal
        : (meals.find(m => m.id === mealId) || buddyMeals.find(m => m.id === mealId))

      const baselineCount = source?.likes_count || 0
      const baselineLiked = !!source?.liked_by_me

      // Optimistically update UI: flip liked and adjust count
      setSelectedMeal(prev => prev && prev.id === mealId ? { ...prev, liked_by_me: !baselineLiked, likes_count: baselineLiked ? Math.max(0, baselineCount - 1) : baselineCount + 1 } : prev)
      setMeals(prev => prev.map(meal => meal.id === mealId ? { ...meal, liked_by_me: !baselineLiked, likes_count: baselineLiked ? Math.max(0, baselineCount - 1) : baselineCount + 1 } : meal))
      setBuddyMeals(prev => prev.map(meal => meal.id === mealId ? { ...meal, liked_by_me: !baselineLiked, likes_count: baselineLiked ? Math.max(0, baselineCount - 1) : baselineCount + 1 } : meal))

      // Make API call
      const result = baselineLiked ? await unlikeMeal(mealId) : await likeMeal(mealId)

      // Reconcile with server response
      setSelectedMeal(prev => prev && prev.id === mealId ? { ...prev, liked_by_me: result.liked_by_me, likes_count: result.likes_count } : prev)
      setMeals(prev => prev.map(meal => meal.id === mealId ? { ...meal, liked_by_me: result.liked_by_me, likes_count: result.likes_count } : meal))
      setBuddyMeals(prev => prev.map(meal => meal.id === mealId ? { ...meal, liked_by_me: result.liked_by_me, likes_count: result.likes_count } : meal))

    } catch (err: any) {
      setError(err.message || 'Failed to update like')
      // On error, we could refetch, but minimally do nothing so UI remains consistent with last known data
    }
  }

  async function handleCommentSubmit(mealId: number) {
    if (!commentText.trim()) return

    try {
      setError(null)
      const newComment = await postComment(mealId, commentText.trim())

      // Update selected meal if it's the one being commented on
      if (selectedMeal?.id === mealId) {
        setSelectedMeal(prev => {
          if (!prev) return null
          const existing = prev.comments || []
          const already = existing.some(c => c.id === newComment.id)
          return {
            ...prev,
            comments: already ? existing : [newComment, ...existing],
            comments_count: (prev.comments_count || 0) + (already ? 0 : 1)
          }
        })
      }

      // Update meals with new comment
      setMeals(prev => prev.map(meal =>
        meal.id === mealId ? {
          ...meal,
          comments: (meal.comments || []).some(c => c.id === newComment.id)
            ? (meal.comments || [])
            : [newComment, ...(meal.comments || [])],
          comments_count: (meal.comments_count || 0) + ((meal.comments || []).some(c => c.id === newComment.id) ? 0 : 1)
        } : meal
      ))

      setBuddyMeals(prev => prev.map(meal =>
        meal.id === mealId ? {
          ...meal,
          comments: (meal.comments || []).some(c => c.id === newComment.id)
            ? (meal.comments || [])
            : [newComment, ...(meal.comments || [])],
          comments_count: (meal.comments_count || 0) + ((meal.comments || []).some(c => c.id === newComment.id) ? 0 : 1)
        } : meal
      ))

      setCommentText('')
    } catch (err: any) {
      setError(err.message || 'Failed to post comment')
    }
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
            {buddyStatus?.is_buddy && (
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
          <button
            onClick={() => window.location.href = '/notifications-test'}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '20px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}
          >
            🔔 Test
          </button>
        </div>
      </div>

      {/* Profile Incomplete Banner */}
      <AnimatePresence>
        {isProfileIncomplete && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              overflow: 'hidden'
            }}
          >
            <div style={{
              backgroundColor: '#f59e0b',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: 'white'
                }}>
                  Complete your profile for better meal suggestions and buddy matching
                </span>
              </div>
              <button
                onClick={() => window.location.href = '/onboarding'}
                style={{
                  backgroundColor: 'white',
                  color: '#f59e0b',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Complete Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          {buddyStatus?.is_buddy && (
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
              key={`${m.user_id === currentUserId ? 'mine' : 'buddy'}-${m.id}-${m.logged_at}`}
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
                borderLeft: `4px solid ${m.user_id === currentUserId ? 'var(--accent-orange)' : 'var(--accent-blue)'}`,
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
                backgroundColor: m.user_id === currentUserId ? 'var(--accent-orange)' : 'var(--accent-blue)',
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
                  <span style={{
                    fontSize: '12px',
                    color: m.user_id === currentUserId ? 'var(--accent-orange)' : 'var(--accent-blue)',
                    fontWeight: '600'
                  }}>
                    ({getMealDisplayName(m)})
                  </span>
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
                {/* Like Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleLike(m.id)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title={m.liked_by_me ? 'Unlike this meal' : 'Like this meal'}
                >
                  {m.liked_by_me ? '❤️' : '🤍'}
                </button>

                {/* Like Count */}
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  textAlign: 'center'
                }}>
                  {m.likes_count ?? 0}
                </div>

                {m.user_id === currentUserId && (
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
        onToggleLike={toggleLike}
        commentText={commentText}
        onCommentTextChange={setCommentText}
        onCommentSubmit={handleCommentSubmit}
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

