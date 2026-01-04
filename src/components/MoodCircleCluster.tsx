import { useCallback, useState, useRef } from 'react'
import { motion, useSpring, useAnimationFrame, useMotionValue } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { getMoodColor } from '@/utils/colorUtils'
import { MOOD_LABELS } from '@/types'
import type { Mood } from '@/types'
import styles from './MoodCircleCluster.module.css'

interface MoodCircleClusterProps {
  onSelect: (mood: Mood) => void
  compact?: boolean
  selectedMood?: Mood | null
}

// Cluster positions for organic arrangement - using viewport-relative sizes
const CLUSTER_POSITIONS = [
  { x: -130, y: -130, size: 200 },  // Great - top left
  { x: 130, y: -130, size: 180 },   // Normal - top right
  { x: -130, y: 130, size: 170 },   // Meh - bottom left
  { x: 130, y: 130, size: 160 },    // Awful - bottom right
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
  { speedX: 0.0008, speedY: 0.0011, radiusX: 20, radiusY: 16, phaseX: 0, phaseY: 0.5 },
  { speedX: 0.0012, speedY: 0.0009, radiusX: 16, radiusY: 22, phaseX: 1.2, phaseY: 2.1 },
  { speedX: 0.0010, speedY: 0.0013, radiusX: 22, radiusY: 18, phaseX: 2.5, phaseY: 1.0 },
  { speedX: 0.0014, speedY: 0.0010, radiusX: 18, radiusY: 20, phaseX: 0.8, phaseY: 3.2 },
]

export function MoodCircleCluster({ onSelect, compact = false, selectedMood = null }: MoodCircleClusterProps) {
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
    
    mouseX.set(offsetX * 30)
    mouseY.set(offsetY * 30)
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
          const isSelected = selectedMood === value
          
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
              isSelected={isSelected}
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
  isSelected: boolean
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
  isSelected,
  theme,
  mouseX,
  mouseY,
  ambientDampen,
  time,
  onSelect,
  onHover,
  onLeave,
}: MoodCircleProps) {
  // Each circle moves based on mouse, with varying influence
  const influence = 1 - index * 0.1
  
  // Dynamic size and position motion values
  const dynamicSize = useMotionValue(position.size)
  const x = useMotionValue(position.x - position.size / 2)
  const y = useMotionValue(position.y - position.size / 2)
  const localTimeRef = useRef(time)
  localTimeRef.current = time
  
  // Update size and position based on movement and time using animation frame
  useAnimationFrame(() => {
    const mouseXVal = mouseX.get()
    const mouseYVal = mouseY.get()
    const dampened = ambientDampen.get()
    const currentTime = localTimeRef.current
    
    // Recalculate ambient position for current time
    const currentAmbientX = Math.sin(currentTime * ambientParams.speedX + ambientParams.phaseX) * ambientParams.radiusX
    const currentAmbientY = Math.cos(currentTime * ambientParams.speedY + ambientParams.phaseY) * ambientParams.radiusY
    
    // Calculate movement distance from center
    const mouseDistance = Math.sqrt(mouseXVal * mouseXVal + mouseYVal * mouseYVal)
    const ambientDistance = Math.sqrt(currentAmbientX * currentAmbientX + currentAmbientY * currentAmbientY) * dampened
    
    // Combine movements and normalize to create size variation
    // Use a sine wave based on time and movement for smooth oscillation
    const movementFactor = (mouseDistance + ambientDistance) / 50
    const timeBasedVariation = Math.sin(currentTime * 0.001 + index) * 0.5
    
    // Combine both factors, limit to +/- 20 pixels
    const variation = (movementFactor * 0.3 + timeBasedVariation * 0.7) * 20
    const clampedVariation = Math.max(-20, Math.min(20, variation))
    const currentSize = position.size + clampedVariation
    dynamicSize.set(currentSize)
    
    // Update position with new size for proper centering
    x.set(position.x - currentSize / 2 + mouseXVal * influence + currentAmbientX * dampened)
    y.set(position.y - currentSize / 2 + mouseYVal * influence + currentAmbientY * dampened)
  })

  // Calculate scale based on hover and selected state
  const getScale = () => {
    if (isHovered) return 1.25
    if (isSelected) return 1.15
    if (isOtherHovered) return 0.8
    return 1
  }

  return (
    <motion.button
      className={styles.circle}
      style={{
        width: dynamicSize,
        height: dynamicSize,
        backgroundColor: getMoodColor(value, theme),
        x,
        y,
        zIndex: isHovered ? 10 : 1,
        ...(isSelected && {
          boxShadow: '0 0 0 3px var(--color-primary)',
        }),
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

