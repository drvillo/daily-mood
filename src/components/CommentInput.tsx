import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './CommentInput.module.css'

interface CommentInputProps {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  maxLength?: number
  autoFocus?: boolean
}

const DEFAULT_MAX_LENGTH = 100

export function CommentInput({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = 'Add a note (optional)',
  maxLength = DEFAULT_MAX_LENGTH,
  autoFocus = false,
}: CommentInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [characterCount, setCharacterCount] = useState(value.length)

  // Auto-resize textarea - ensure minimum 2 lines, no scrollbar on load
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get correct scrollHeight
    textarea.style.height = 'auto'
    // Calculate height for 2 lines (line-height * 2 + padding)
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 24
    const paddingTop = parseFloat(getComputedStyle(textarea).paddingTop) || 12
    const paddingBottom = parseFloat(getComputedStyle(textarea).paddingBottom) || 12
    const minHeight = lineHeight * 2 + paddingTop + paddingBottom
    
    // Set height to scrollHeight, but ensure at least 2 lines and limit to ~3 lines (max ~120px)
    const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, 120))
    textarea.style.height = `${newHeight}px`
  }, [value])

  // Update character count
  useEffect(() => {
    setCharacterCount(value.length)
  }, [value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      if (newValue.length <= maxLength) {
        onChange(newValue)
      }
    },
    [onChange, maxLength]
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent Enter from submitting (allow Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // Blur to close mobile keyboard
      textareaRef.current?.blur()
    }
  }, [])

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      // Small delay to ensure smooth animation
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }, [autoFocus])

  const remainingChars = maxLength - characterCount
  const isNearLimit = remainingChars < 50

  return (
    <div className={styles.container}>
      <label htmlFor="comment-input" className={styles.label}>
        <span className="sr-only">Add a comment</span>
        <textarea
          id="comment-input"
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={2}
          aria-label="Add a note"
          aria-describedby="comment-counter"
        />
      </label>
      <div
        id="comment-counter"
        className={`${styles.counter} ${isNearLimit ? styles.nearLimit : ''}`}
        aria-live="polite"
      >
        {characterCount} / {maxLength}
      </div>
    </div>
  )
}

