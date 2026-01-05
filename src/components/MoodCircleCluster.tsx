import { useCallback, useState, useRef, useEffect } from 'react'
import { motion, useAnimationFrame } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { getMoodColor } from '@/utils/colorUtils'
import { MOOD_LABELS } from '@/types'
import type { Mood } from '@/types'
import styles from './MoodCircleCluster.module.css'

// Customizable physics configuration
export interface PhysicsConfig {
  baseSpeed?: number        // Base drift speed (default: 1)
  damping?: number          // Velocity damping per frame (default: 0.995)
  bounceDamping?: number    // Velocity reduction on bounce (default: 0.8)
  repulsionStrength?: number // Mouse/touch repulsion force (default: 0.15)
  repulsionThreshold?: number // Distance at which repulsion starts (default: 120)
  margin?: number           // Boundary margin in pixels (default: 20)
}

interface MoodCircleClusterProps {
  onSelect: (mood: Mood) => void
  compact?: boolean
  selectedMood?: Mood | null
  boundsRef?: React.RefObject<HTMLElement | null>
  physicsConfig?: PhysicsConfig
}

// Physics constants
const MARGIN = 20 // Boundary margin in pixels
const DAMPING = 0.995 // Velocity damping per frame (friction)
const BOUNCE_DAMPING = 0.8 // Velocity reduction on bounce
const REPULSION_THRESHOLD = 120 // Distance at which repulsion starts
const REPULSION_STRENGTH = 0.15 // Gentle repulsion force
const BASE_SPEED = 1 // Faster drift speed for more travel
const FOOTER_PUSH_FORCE = 0.8 // Force applied when footer pushes circles up
const CIRCLE_SIZES = [140, 130, 120, 110] // Sizes for each circle
const COMPACT_CIRCLE_SIZES = [90, 85, 80, 75] // Sizes for compact mode
const SIZE_VARIATION = 0.15 // 15% size variation based on speed (1.0x to 1.15x)
const SIZE_SMOOTHING = 0.15 // Smoothing factor for size transitions (0-1, higher = smoother)

// Physics state for each circle
interface CirclePhysics {
  x: number
  y: number
  vx: number
  vy: number
  baseRadius: number // Original radius (constant)
  radius: number // Current dynamic radius
  targetRadius: number // Target radius based on speed
  isPinned: boolean
}

// Bounds for constraining circle movement
interface Bounds {
  left: number
  top: number
  width: number
  height: number
}

// Get bounds from ref element or fall back to viewport
function getBounds(boundsRef?: React.RefObject<HTMLElement | null>): Bounds {
  if (boundsRef?.current) {
    const rect = boundsRef.current.getBoundingClientRect()
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
  }
  return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
}

// Initialize circle positions clustered at center with outward velocities
function initializeCircles(
  bounds: Bounds,
  sizes: number[],
  baseSpeed: number
): CirclePhysics[] {
  const centerX = bounds.left + bounds.width / 2
  const centerY = bounds.top + bounds.height / 2
  
  // Create circles clustered near center with random outward velocities
  return sizes.map((size, index) => {
    // Start clustered near center with small random offset
    const angle = (index / sizes.length) * Math.PI * 2 + Math.random() * 0.5
    const startOffset = 30 + Math.random() * 20
    
    // Random outward velocity
    const velocityAngle = angle + (Math.random() - 0.5) * 0.5
    const speed = baseSpeed * (0.8 + Math.random() * 0.4)
    
    const baseRadius = size / 2
    
    return {
      x: centerX + Math.cos(angle) * startOffset,
      y: centerY + Math.sin(angle) * startOffset,
      vx: Math.cos(velocityAngle) * speed,
      vy: Math.sin(velocityAngle) * speed,
      baseRadius,
      radius: baseRadius,
      targetRadius: baseRadius,
      isPinned: false,
    }
  })
}

export function MoodCircleCluster({ onSelect, compact = false, selectedMood = null, boundsRef, physicsConfig }: MoodCircleClusterProps) {
  const { theme } = useTheme()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  // Merge physics config with defaults
  const config = {
    baseSpeed: physicsConfig?.baseSpeed ?? BASE_SPEED,
    damping: physicsConfig?.damping ?? DAMPING,
    bounceDamping: physicsConfig?.bounceDamping ?? BOUNCE_DAMPING,
    repulsionStrength: physicsConfig?.repulsionStrength ?? REPULSION_STRENGTH,
    repulsionThreshold: physicsConfig?.repulsionThreshold ?? REPULSION_THRESHOLD,
    margin: physicsConfig?.margin ?? MARGIN,
  }
  
  // Store config in ref for animation frame access
  const configRef = useRef(config)
  configRef.current = config
  
  // Track mouse/touch position globally
  const mousePos = useRef({ x: -1000, y: -1000 })
  const isMouseActive = useRef(false)
  
  // Track footer state (only used when no custom bounds)
  const footerHeightRef = useRef(0)
  const prevFooterHeightRef = useRef(0)
  
  // Stable ref to access boundsRef in animation frame
  const boundsRefStable = useRef(boundsRef)
  boundsRefStable.current = boundsRef
  
  // Physics state
  const sizes = compact ? COMPACT_CIRCLE_SIZES : CIRCLE_SIZES
  const circlesRef = useRef<CirclePhysics[]>([])
  const [, forceUpdate] = useState(0)
  const animationTimeRef = useRef(0)
  
  // Initialize circles on mount or when viewport/bounds change
  useEffect(() => {
    const initCircles = () => {
      const bounds = getBounds(boundsRef)
      circlesRef.current = initializeCircles(bounds, sizes, config.baseSpeed)
      forceUpdate(n => n + 1)
    }
    
    initCircles()
    window.addEventListener('resize', initCircles)
    return () => window.removeEventListener('resize', initCircles)
  }, [sizes, boundsRef, config.baseSpeed])
  
  // Track global mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      isMouseActive.current = true
    }
    
    const handleMouseLeave = () => {
      isMouseActive.current = false
      mousePos.current = { x: -1000, y: -1000 }
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        isMouseActive.current = true
      }
    }
    
    const handleTouchEnd = () => {
      isMouseActive.current = false
      mousePos.current = { x: -1000, y: -1000 }
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])
  
  // Observe footer element for open/close state
  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null
    let mutationObserver: MutationObserver | null = null
    
    const updateFooterHeight = () => {
      const footer = document.getElementById('settings-footer')
      if (footer) {
        const rect = footer.getBoundingClientRect()
        footerHeightRef.current = rect.height
      } else {
        footerHeightRef.current = 0
      }
    }
    
    // Initial check
    updateFooterHeight()
    
    // Watch for footer appearing/disappearing in DOM
    mutationObserver = new MutationObserver(() => {
      updateFooterHeight()
      
      // Set up resize observer on footer if it exists
      const footer = document.getElementById('settings-footer')
      if (footer && resizeObserver) {
        resizeObserver.observe(footer)
      }
    })
    
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })
    
    // Watch for footer size changes
    resizeObserver = new ResizeObserver(() => {
      updateFooterHeight()
    })
    
    // If footer already exists, observe it
    const existingFooter = document.getElementById('settings-footer')
    if (existingFooter) {
      resizeObserver.observe(existingFooter)
    }
    
    return () => {
      mutationObserver?.disconnect()
      resizeObserver?.disconnect()
    }
  }, [])
  
  // Main physics animation loop
  useAnimationFrame((delta) => {
    const circles = circlesRef.current
    if (circles.length === 0) return
    
    // Get current physics config
    const cfg = configRef.current
    
    // Track animation time for smooth pulsing
    // Note: delta from useAnimationFrame is total elapsed time since start, not frame delta
    animationTimeRef.current = delta / 1000
    
    // Get current bounds (from ref or viewport)
    const bounds = getBounds(boundsRefStable.current)
    const hasCustomBounds = !!boundsRefStable.current?.current
    
    // Only use footer height when not constrained to custom bounds
    const footerHeight = hasCustomBounds ? 0 : footerHeightRef.current
    const prevFooterHeight = prevFooterHeightRef.current
    
    // Calculate boundaries using config margin
    const leftBoundary = bounds.left + cfg.margin
    const rightBoundary = bounds.left + bounds.width - cfg.margin
    const topBoundary = bounds.top + cfg.margin
    const bottomBoundary = bounds.top + bounds.height - footerHeight - cfg.margin
    
    // Detect if footer just opened (height increased significantly) - only for viewport mode
    const footerJustOpened = !hasCustomBounds && footerHeight > prevFooterHeight + 50
    
    // Update previous footer height
    prevFooterHeightRef.current = footerHeight
    
    // Update each circle's physics
    circles.forEach((circle, i) => {
      // Skip physics if pinned (user is directly hovering/touching)
      if (circle.isPinned) return
      
      // If footer just opened and circle is in the footer area, push it up
      if (footerJustOpened && circle.y + circle.radius > bottomBoundary) {
        // Apply upward push force
        circle.vy = -FOOTER_PUSH_FORCE * (1 + Math.random() * 0.5)
        // Move circle above footer immediately
        circle.y = bottomBoundary - circle.radius - 10
      }
      
      // Apply velocity
      circle.x += circle.vx
      circle.y += circle.vy
      
      // Boundary collision - horizontal
      if (circle.x - circle.radius < leftBoundary) {
        circle.x = leftBoundary + circle.radius
        circle.vx = Math.abs(circle.vx) * cfg.bounceDamping
        // Add slight random angle change on bounce
        circle.vy += (Math.random() - 0.5) * 0.1
      } else if (circle.x + circle.radius > rightBoundary) {
        circle.x = rightBoundary - circle.radius
        circle.vx = -Math.abs(circle.vx) * cfg.bounceDamping
        circle.vy += (Math.random() - 0.5) * 0.1
      }
      
      // Boundary collision - vertical (top)
      if (circle.y - circle.radius < topBoundary) {
        circle.y = topBoundary + circle.radius
        circle.vy = Math.abs(circle.vy) * cfg.bounceDamping
        circle.vx += (Math.random() - 0.5) * 0.1
      }
      
      // Boundary collision - vertical (bottom)
      if (circle.y + circle.radius > bottomBoundary) {
        circle.y = bottomBoundary - circle.radius
        circle.vy = -Math.abs(circle.vy) * cfg.bounceDamping
        circle.vx += (Math.random() - 0.5) * 0.1
      }
      
      // Circle-to-circle collision
      circles.forEach((other, j) => {
        if (i >= j) return // Only check each pair once
        
        const dx = other.x - circle.x
        const dy = other.y - circle.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const minDist = circle.radius + other.radius + 5 // 5px buffer before touching
        
        if (dist < minDist && dist > 0) {
          // Circles are overlapping - push them apart
          const nx = dx / dist
          const ny = dy / dist
          
          // Separate circles
          const overlap = (minDist - dist) / 2
          circle.x -= nx * overlap
          circle.y -= ny * overlap
          other.x += nx * overlap
          other.y += ny * overlap
          
          // Exchange velocity components along collision normal
          const dvx = circle.vx - other.vx
          const dvy = circle.vy - other.vy
          const dvn = dvx * nx + dvy * ny
          
          // Only resolve if circles are moving toward each other
          if (dvn > 0) {
            circle.vx -= dvn * nx * cfg.bounceDamping
            circle.vy -= dvn * ny * cfg.bounceDamping
            other.vx += dvn * nx * cfg.bounceDamping
            other.vy += dvn * ny * cfg.bounceDamping
          }
        }
      })
      
      // Mouse/touch proximity repulsion
      if (isMouseActive.current) {
        const dx = circle.x - mousePos.current.x
        const dy = circle.y - mousePos.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        // Apply repulsion if within threshold but not inside circle
        if (dist < cfg.repulsionThreshold && dist > circle.radius) {
          const force = ((cfg.repulsionThreshold - dist) / cfg.repulsionThreshold) * cfg.repulsionStrength
          const nx = dx / dist
          const ny = dy / dist
          circle.vx += nx * force
          circle.vy += ny * force
        }
      }
      
      // Apply damping (friction)
      circle.vx *= cfg.damping
      circle.vy *= cfg.damping
      
      // Maintain minimum velocity to keep movement going
      const speed = Math.sqrt(circle.vx * circle.vx + circle.vy * circle.vy)
      if (speed < cfg.baseSpeed * 0.5) {
        // Boost velocity slightly in current direction
        if (speed > 0.01) {
          circle.vx = (circle.vx / speed) * cfg.baseSpeed * 0.6
          circle.vy = (circle.vy / speed) * cfg.baseSpeed * 0.6
        } else {
          // Random direction if nearly stopped
          const angle = Math.random() * Math.PI * 2
          circle.vx = Math.cos(angle) * cfg.baseSpeed * 0.6
          circle.vy = Math.sin(angle) * cfg.baseSpeed * 0.6
        }
      }
      
      // Cap maximum speed
      const maxSpeed = cfg.baseSpeed * 3
      if (speed > maxSpeed) {
        circle.vx = (circle.vx / speed) * maxSpeed
        circle.vy = (circle.vy / speed) * maxSpeed
      }
      
      // // Update dynamic size based on speed and time
      // // Combine speed-based pulsing with time-based oscillation for smooth effect
      // const normalizedSpeed = Math.min(speed / (cfg.baseSpeed * SIZE_SPEED_SCALE), 1) // Normalize to 0-1
      
      // // Speed-based size increase (faster = larger)
      // const speedMultiplier = 1 + SIZE_VARIATION * Math.pow(normalizedSpeed, 0.7)
      
      // // Time-based smooth oscillation (sine wave for natural pulsing)
      // // Each circle pulses at slightly different phase for organic feel
      // const pulsePhase = (i * 0.5 + animationTimeRef.current * 0.3) % (Math.PI * 2)
      // const timePulse = Math.sin(pulsePhase) * SIZE_VARIATION * 0.3 // Smaller oscillation
      
      // // Combine both effects for smooth decrease and increase
      // const sizeMultiplier = speedMultiplier + timePulse
      // circle.targetRadius = circle.baseRadius * sizeMultiplier
      const pulsePhase = (i * 0.5 + animationTimeRef.current * 0.3) % (Math.PI * 2)
      const sizeMultiplier = 1 + Math.sin(pulsePhase) * SIZE_VARIATION * 0.3
      circle.targetRadius = circle.baseRadius * sizeMultiplier
      // Smoothly interpolate to target radius
      circle.radius += (circle.targetRadius - circle.radius) * SIZE_SMOOTHING
    })
    
    // Trigger re-render
    forceUpdate(n => n + 1)
  })
  
  // Handle circle hover/pin
  const handleCircleEnter = useCallback((index: number) => {
    setHoveredIndex(index)
    if (circlesRef.current[index]) {
      circlesRef.current[index].isPinned = true
    }
  }, [])
  
  const handleCircleLeave = useCallback((index: number) => {
    setHoveredIndex(null)
    if (circlesRef.current[index]) {
      circlesRef.current[index].isPinned = false
    }
  }, [])
  
  const circles = circlesRef.current
  
  return (
    <div className={styles.container}>
      {circles.map((circle, index) => {
        const { value, label } = MOOD_LABELS[index]
        const isHovered = hoveredIndex === index
        const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index
        const isSelected = selectedMood === value
        
        return (
          <motion.button
            key={value}
            className={styles.circle}
            style={{
              width: circle.radius * 2,
              height: circle.radius * 2,
              backgroundColor: getMoodColor(value, theme),
              left: circle.x - circle.radius,
              top: circle.y - circle.radius,
              zIndex: isHovered ? 10 : 1,
              ...(isSelected && {
                boxShadow: '0 0 0 3px var(--color-primary)',
              }),
            }}
            onClick={() => onSelect(value)}
            onMouseEnter={() => handleCircleEnter(index)}
            onMouseLeave={() => handleCircleLeave(index)}
            onTouchStart={() => handleCircleEnter(index)}
            animate={{ 
              opacity: isOtherHovered ? 0.6 : 1,
              // Only apply scale on hover (when pinned) to avoid conflict with physics-based sizing
              scale: isHovered ? 1.15 : 1,
            }}
            transition={{
              opacity: { duration: 0.2 },
              scale: { 
                type: 'spring',
                stiffness: 400,
                damping: 25,
              },
            }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Select mood: ${label}`}
          >
            <span className={styles.label}>{label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
