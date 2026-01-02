import { useCallback, useState, useRef } from 'react'
import { motion, useSpring, useTransform, useAnimationFrame } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { getMoodColor } from '@/utils/colorUtils'
import { MOOD_LABELS } from '@/types'
import type { Mood } from '@/types'
import styles from './MoodCircleCluster.module.css'

interface MoodCircleClusterProps {
  onSelect: (mood: Mood) => void
  compact?: boolean
}

// Cluster positions for organic arrangement - using viewport-relative sizes
const CLUSTER_POSITIONS = [
  { x: -90, y: -90, size: 140 },  // Great - top left
  { x: 90, y: -90, size: 125 },   // Normal - top right
  { x: -90, y: 90, size: 115 },   // Meh - bottom left
  { x: 90, y: 90, size: 105 },    // Awful - bottom right
]

// Compact positions for modal (smaller sizes)
const COMPACT_CLUSTER_POSITIONS = [
  { x: -70, y: -70, size: 100 },  // Great - top left
  { x: 70, y: -70, size: 90 },   // Normal - top right
  { x: -70, y: 70, size: 85 },   // Meh - bottom left
  { x: 70, y: 70, size: 80 },    // Awful - bottom right
]

// Ambient movement parameters for each circle
const AMBIENT_PARAMS = [
  { speedX: 0.0008, speedY: 0.0011, radiusX: 15, radiusY: 12, phaseX: 0, phaseY: 0.5 },
  { speedX: 0.0012, speedY: 0.0009, radiusX: 12, radiusY: 18, phaseX: 1.2, phaseY: 2.1 },
  { speedX: 0.0010, speedY: 0.0013, radiusX: 18, radiusY: 14, phaseX: 2.5, phaseY: 1.0 },
  { speedX: 0.0014, speedY: 0.0010, radiusX: 14, radiusY: 16, phaseX: 0.8, phaseY: 3.2 },
]

export function MoodCircleCluster({ onSelect, compact = false }: MoodCircleClusterProps) {
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [time, setTime] = useState(0)

  const positions = compact ? COMPACT_CLUSTER_POSITIONS : CLUSTER_POSITIONS

  // Mouse position for cluster movement
  const mouseX = useSpring(0, { stiffness: 120, damping: 15 })
  const mouseY = useSpring(0, { stiffness: 120, damping: 15 })

  // Ambient animation dampening (1 = full movement, 0 = stopped)
  const ambientDampen = useSpring(1, { stiffness: 50, damping: 20 })

  // Animate time for ambient movement
  useAnimationFrame((_, delta) => {
    setTime(t => t + delta)
  })

  // Handle mouse movement over the cluster area
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // Calculate offset from center, normalized - more pronounced movement
    const offsetX = (e.clientX - centerX) / (rect.width / 2)
    const offsetY = (e.clientY - centerY) / (rect.height / 2)
    
    mouseX.set(offsetX * 25)
    mouseY.set(offsetY * 25)
  }, [mouseX, mouseY])

  const handleMouseEnter = useCallback(() => {
    ambientDampen.set(0) // Slow down ambient movement
  }, [ambientDampen])

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
    setHoveredIndex(null)
    ambientDampen.set(1) // Resume ambient movement
  }, [mouseX, mouseY, ambientDampen])

  return (
    <div 
      ref={containerRef}
      className={compact ? styles.compactContainer : styles.container}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.cluster}>
        {MOOD_LABELS.map(({ value, label }, index) => {
          const pos = positions[index]
          const ambient = AMBIENT_PARAMS[index]
          const isHovered = hoveredIndex === index
          const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index
          
          return (
            <MoodCircle
              key={value}
              value={value}
              label={label}
              position={pos}
              ambientParams={ambient}
              index={index}
              isHovered={isHovered}
              isOtherHovered={isOtherHovered}
              theme={theme}
              mouseX={mouseX}
              mouseY={mouseY}
              ambientDampen={ambientDampen}
              time={time}
              onSelect={onSelect}
              onHover={() => setHoveredIndex(index)}
              onLeave={() => setHoveredIndex(null)}
            />
          )
        })}
      </div>
    </div>
  )
}

interface MoodCircleProps {
  value: Mood
  label: string
  position: { x: number; y: number; size: number }
  ambientParams: { speedX: number; speedY: number; radiusX: number; radiusY: number; phaseX: number; phaseY: number }
  index: number
  isHovered: boolean
  isOtherHovered: boolean
  theme: 'light' | 'dark'
  mouseX: ReturnType<typeof useSpring>
  mouseY: ReturnType<typeof useSpring>
  ambientDampen: ReturnType<typeof useSpring>
  time: number
  onSelect: (mood: Mood) => void
  onHover: () => void
  onLeave: () => void
}

function MoodCircle({
  value,
  label,
  position,
  ambientParams,
  index,
  isHovered,
  isOtherHovered,
  theme,
  mouseX,
  mouseY,
  ambientDampen,
  time,
  onSelect,
  onHover,
  onLeave,
}: MoodCircleProps) {
  // Calculate ambient floating position
  const ambientX = Math.sin(time * ambientParams.speedX + ambientParams.phaseX) * ambientParams.radiusX
  const ambientY = Math.cos(time * ambientParams.speedY + ambientParams.phaseY) * ambientParams.radiusY

  // Each circle moves based on mouse, with varying influence
  const influence = 1 - index * 0.1
  
  // Combine ambient movement with mouse-based movement
  const x = useTransform(mouseX, (mouseVal) => {
    const dampened = ambientDampen.get()
    return position.x + mouseVal * influence + ambientX * dampened
  })
  
  const y = useTransform(mouseY, (mouseVal) => {
    const dampened = ambientDampen.get()
    return position.y + mouseVal * influence + ambientY * dampened
  })

  // Calculate scale based on hover state
  const getScale = () => {
    if (isHovered) return 1.25
    if (isOtherHovered) return 0.8
    return 1
  }

  return (
    <motion.button
      className={styles.circle}
      style={{
        width: position.size,
        height: position.size,
        backgroundColor: getMoodColor(value, theme),
        x,
        y,
        zIndex: isHovered ? 10 : 1,
      }}
      onClick={() => onSelect(value)}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: isOtherHovered ? 0.6 : 1,
        scale: getScale(),
      }}
      transition={{
        opacity: { duration: 0.2 },
        scale: { 
          type: 'spring',
          stiffness: 400,
          damping: 25,
        },
      }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Select mood: ${label}`}
    >
      <span className={styles.label}>{label}</span>
    </motion.button>
  )
}

